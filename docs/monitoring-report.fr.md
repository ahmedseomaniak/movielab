# Rapport d'Architecture — Monitoring

**Projet :** MovieLab  
**Date :** Juillet 2026  
**Auteur :** Équipe Technique  
**Sujet :** Implémentation de la Stack d'Observabilité pour l'API MovieLab

---

## Résumé Exécutif

Une stack de monitoring légère (Prometheus + Grafana + Node Exporter) a été intégrée à l'application MovieLab pour offrir une visibilité en temps réel sur la santé de l'API, les performances de la JVM et l'utilisation des ressources système. La stack est entièrement conteneurisée, sans coût de licence, et ne nécessite aucune dépendance SaaS tierce.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Stack de Monitoring                     │
│                          (Docker Compose)                      │
│                                                                │
│   ┌────────────────┐      ┌────────────────┐                   │
│   │   Prometheus   │◄─────│ Node Exporter  │  Métriques        │
│   │   (:9090)      │      │  (:9100)       │  système          │
│   │                │      └────────────────┘                   │
│   │  stocke toutes │                                           │
│   │  les métriques │      ┌────────────────┐                   │
│   │  en série      │─────►│    Grafana     │  Visualisation    │
│   │  temporelle    │      │  (:3000)       │  & tableaux       │
│   └───────┬────────┘      └────────────────┘                   │
│           │                                                    │
│           │  scrape /actuator/prometheus toutes les 15s        │
│           ▼                                                    │
│   ┌────────────────┐                                           │
│   │  MovieLab API  │  Spring Boot + Micrometer                 │
│   │  (:8080)       │  Métriques JVM, HTTP et applicatives     │
│   └────────────────┘                                           │
└────────────────────────────────────────────────────────────────┘
```

### Flux de Données

1. **Micrometer** (embarqué dans la JVM) collecte les métriques d'exécution — mémoire heap/non-heap, états des threads, pauses du GC, compteurs et latences des requêtes HTTP, utilisation CPU.
2. **Spring Boot Actuator** expose ces métriques sur `/actuator/prometheus` au format texte Prometheus.
3. **Prometheus** scrape cet endpoint toutes les 15 secondes et stocke les données dans sa base de données série temporelle locale.
4. **Grafana** interroge Prometheus via PromQL et affiche le tableau de bord MovieLab Overview avec six panneaux préconfigurés.
5. **Node Exporter** s'exécute en parallèle et alimente Prometheus en métriques système (CPU, mémoire, disque, réseau).

---

## Composants

### 1. Instrumentation du Backend (`server/`)

| Composant | Technologie | Rôle |
|-----------|------------|------|
| Collecte de métriques | Micrometer (via `micrometer-registry-prometheus`) | Instrumentation JVM & HTTP |
| Export HTTP | Spring Boot Actuator | Expose l'endpoint `/actuator/prometheus` |
| Configuration | `application.properties` | Endpoints activés, tagging du nom d'application |

**Endpoints exposés :**

| Endpoint | Contenu | Utilisé par |
|----------|---------|-------------|
| `/actuator/health` | Statut JSON de santé (DB, disque, ping) | Load balancers, health checks Docker |
| `/actuator/metrics` | Noms des métriques disponibles | Débogage manuel |
| `/actuator/prometheus` | Métriques au format Prometheus | Scraper Prometheus |

### 2. Prometheus (`monitoring/prometheus/`)

La couche de stockage des métriques. Scrape quatre cibles.

| Job | Cible | Intervalle | Rôle |
|-----|-------|------------|------|
| `prometheus` | `localhost:9090` | 15s | Métriques Prometheus internes |
| `node-exporter` | `node-exporter:9100` | 15s | CPU, RAM, disque, réseau de l'hôte |
| `movielab-api` | `host.docker.internal:8080/actuator/prometheus` | 15s | Métriques applicatives & JVM |
| `movielab-api-production` | `movielab-api.onrender.com` | 60s | Métriques de production (optionnel) |

### 3. Grafana (`monitoring/grafana/`)

La couche de visualisation. Auto-provisionnée au démarrage — aucune configuration manuelle requise.

**Tableau de bord MovieLab Overview — 6 panneaux :**

| Panneau | Requête | Ce qu'il révèle |
|---------|---------|-----------------|
| Mémoire JVM Heap | `jvm_memory_used_bytes{area="heap"}` | Détection de fuite mémoire, dimensionnement |
| Mémoire JVM Non-Heap | `jvm_memory_used_bytes{area="nonheap"}` | Problèmes de Metaspace / class loader |
| Taux de Requêtes HTTP | `rate(http_server_requests_seconds_count[1m])` | Patterns de trafic, pics d'utilisation |
| Latence HTTP (P95) | `histogram_quantile(0.95, ...)` | Détection d'endpoints lents |
| États des Threads JVM | `jvm_threads_states_threads{state=~"runnable\|blocked\|waiting"}` | Contention, interblocages |
| Utilisation CPU | `system_cpu_usage` / `process_cpu_usage` | Utilisation des ressources |

### 4. Node Exporter (`monitoring/docker-compose.yml`)

Expose les métriques de l'hôte Linux. S'exécute dans un conteneur Docker avec des monts en lecture seule vers `/proc`, `/sys` et `/`.

---

## Déploiement

### Développement Local

```bash
# Terminal 1 — démarrer le backend
cd server && TMDB_API_KEY=<clé> ./mvnw spring-boot:run

# Terminal 2 — démarrer la stack de monitoring
cd monitoring && docker compose up -d
```

| Service | URL | Identifiants |
|---------|-----|-------------|
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | — |
| Node Exporter | http://localhost:9100 | — |

### Production (Render)

La configuration Prometheus inclut un job de production pointant vers `movielab-api.onrender.com`. Pour l'utiliser en production, déployez la stack de monitoring sur un VPS ou une VM ayant accès au déploiement Render.

---

## Intégration CI/CD

`.github/workflows/ci.yml` s'exécute à chaque push/PR sur `main`/`develop` :

- **Backend :** `./mvnw clean package` + `./mvnw test`
- **Frontend :** `npm ci` + `npx tsc --noEmit` + `npm run build`

La pipeline CI garantit que le projet compile et que les tests passent. Les tests d'intégration spécifiques au monitoring ne sont pas encore inclus.

---

## Coût

| Composant | Coût |
|-----------|------|
| Prometheus | 0 $ (open source, Apache 2.0) |
| Grafana | 0 $ (open source, AGPLv3) |
| Node Exporter | 0 $ (open source, Apache 2.0) |
| Micrometer | 0 $ (open source, Apache 2.0) |
| Infrastructure | Ressources Docker locales (~2 Go RAM combinés) |

L'exécution de la stack complète en local nécessite Docker et environ 2 Go de mémoire disponible répartis sur les trois conteneurs.

---

## Ce Que Nous Pouvons Maintenant Détecter

| Scénario | Signal Métrique | Panneau |
|----------|-----------------|---------|
| Fuite mémoire | Heap croît de façon monotone sans récupération GC | Mémoire JVM Heap |
| Endpoint lent | La latence P95 dépasse la ligne de base | Latence HTTP (P95) |
| Pic de trafic | Le taux de requêtes bondit de 10x | Taux de Requêtes HTTP |
| Interblocage de threads | Les threads bloqués s'accumulent, les threads exécutables chutent | États des Threads |
| Épuisement CPU | Utilisation CPU soutenue > 90 % | Utilisation CPU |
| Disque saturé | Métriques disque Node Exporter proches de la capacité | (panneau à ajouter) |

---

## Limites & Travaux Futurs

### Lacunes Actuelles

| Lacune | Impact | Calendrier de Solution |
|--------|--------|------------------------|
| Pas d'alerting | Nous ne voyons les problèmes qu'en regardant le tableau de bord | Ajouter Alertmanager pour notifications Slack/email/PagerDuty |
| Pas d'intégration de logs | Impossible de corréler métriques et messages d'erreur | Ajouter Loki ou ELK pour l'agrégation de logs |
| Pas de tracing distribué | Impossible de tracer les requêtes entre services | Ajouter OpenTelemetry + Jaeger |
| Pas de déploiement production persistant | La stack de monitoring ne tourne qu'en local | Déployer sur un petit VPS ou un cron job Render |
| Pas de monitoring de disponibilité | Impossible de savoir si la production est down | Ajouter Grafana Cloud ou UptimeRobot |

### Prochaines Étapes Recommandées (Par Ordre de Priorité)

1. **Configurer Alertmanager** — définir des règles pour : heap > 80 %, P95 > 2 s, taux d'erreur > 5 %, CPU > 90 %, disque > 85 %
2. **Déployer la stack de monitoring en production** — sur un VPS bon marché (5–10 $/mois) pour surveiller le déploiement Render
3. **Ajouter des logs structurés** — envoyer les logs vers Loki pour la corrélation logs-métriques
4. **Créer un panneau de métriques métier personnalisées** — ex. « recherches par minute », « ajouts à la watchlist par jour » avec des compteurs Micrometer

---

## Annexe : Référence Rapide PromQL

```promql
# Ratio d'utilisation du heap JVM
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}

# Taux d'erreur HTTP (5xx / total)
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) 
/ sum(rate(http_server_requests_seconds_count[5m]))

# Temps de réponse au 95e percentile par endpoint
histogram_quantile(0.95, 
  sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri))
```

---

## Conclusion

La stack de monitoring fournit une **observabilité de qualité production sans coût de licence**. Elle couvre les trois piliers clés de l'observabilité :

| Pilier | Couvert ? | Outil |
|--------|-----------|-------|
| Métriques | ✅ | Prometheus + Micrometer |
| Logs | ❌ (prévu) | Loki |
| Tracing | ❌ (prévu) | OpenTelemetry + Jaeger |

La valeur immédiate réside dans la **détection proactive** des fuites mémoire, des régressions de performance et de l'épuisement des ressources avant qu'ils n'impactent les utilisateurs.
