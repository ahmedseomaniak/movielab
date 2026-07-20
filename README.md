# MovieLab

Application full-stack de découverte et gestion de films, connectée à l'API TMDB (The Movie Database).

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18, TypeScript 5, Vite 5, Apollo Client 3 |
| Backend | Spring Boot 3.3, Java 17, Maven |
| API | GraphQL |
| Base de données | H2 (fichier local) |
| Monitoring | Prometheus + Grafana (Docker) |

## Fonctionnalités

- Recherche de films par titre
- Films tendance du moment
- Découverte par genre et note minimale
- Détails d'un film (synopsis, affiche, casting, durée)
- Recommandations personnalisées
- Watchlist personnelle (ajout/suppression, marquer comme vu)

## Prérequis

- Java 17, Node.js 20, Docker (optionnel pour le monitoring)
- Clé API TMDB (variable d'environnement `TMDB_API_KEY`)

## Lancement

```bash
# Backend
cd server
./mvnw clean package -DskipTests
java -jar target/*.jar
# → http://localhost:8080/graphql

# Frontend (autre terminal)
cd client
npm ci
npm run dev
# → http://localhost:5173

# Monitoring (optionnel)
cd monitoring
docker compose up -d
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
```

## CI/CD

- **CI** : GitHub Actions (build & test backend + frontend)
- **Déploiement** : Render (via `render.yaml`)
