# Monitoring Demo Setup

## Stack
- **Spring Boot Actuator + Micrometer** — exposes JVM, HTTP, and app metrics
- **Prometheus** — scrapes and stores metrics
- **Node Exporter** — system-level metrics (CPU, memory, disk, network)
- **Grafana** — dashboards and visualization

---

## 1. Backend Metrics (already configured)

The Spring Boot app now exposes metrics at `/actuator/prometheus`.

**Endpoints:**
- `GET /actuator/health` — health check
- `GET /actuator/metrics` — list of available metrics
- `GET /actuator/prometheus` — Prometheus-scrapable metrics

**Metrics available:**
- JVM memory, threads, GC, classes
- HTTP request rate, latency, error count
- CPU and system load
- Tomcat sessions, datasource pool

---

## 2. Start the Monitoring Stack

```bash
cd monitoring
docker compose up -d
```

| Service | URL | Login |
|---------|-----|-------|
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3000 | admin / admin |
| Node Exporter | http://localhost:9100 | — |

Make sure your backend is running on port 8080 first. Prometheus auto-scrapes it at `host.docker.internal:8080`.

---

## 3. Grafana Dashboards

A pre-configured MovieLab dashboard is auto-provisioned at:
`monitoring/grafana/dashboards/movielab-overview.json`

Panels: JVM heap, non-heap, HTTP request rate, P95 latency, thread states, CPU usage.

**To add more dashboards:**
1. Open Grafana → Dashboards → Import
2. Dashboard ID **4701** (Spring Boot / Micrometer) or **1860** (Node Exporter full)

---

## 4. CI Pipeline

`.github/workflows/ci.yml` runs on every push/PR to `main`:

- **Backend** — `mvn clean package`, runs tests
- **Frontend** — `npm ci`, type check, `npm run build`

No deployment jobs. Just verification.
