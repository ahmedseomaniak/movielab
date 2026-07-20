# Monitoring Architecture Report

**Project:** MovieLab  
**Date:** July 2026  
**Author:** Engineering Team  
**Subject:** Observability Stack Implementation for MovieLab API

---

## Executive Summary

A lightweight monitoring stack (Prometheus + Grafana + Node Exporter) has been integrated into the MovieLab application to provide real-time visibility into API health, JVM performance, and host-level resource usage. The stack is fully containerized, zero-cost, and requires no third-party SaaS dependencies.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        Monitoring Stack                        │
│                          (Docker Compose)                      │
│                                                                │
│   ┌────────────────┐      ┌────────────────┐                   │
│   │   Prometheus   │◄─────│  Node Exporter │  Host-level       │
│   │   (:9090)      │      │  (:9100)       │  metrics          │
│   │                │      └────────────────┘                   │
│   │  stores all    │                                           │
│   │  metrics in    │      ┌────────────────┐                   │
│   │  time-series   │─────►│    Grafana     │  Visualization    │
│   │  DB            │      │  (:3000)       │  & dashboards     │
│   └───────┬────────┘      └────────────────┘                   │
│           │                                                    │
│           │  scrapes /actuator/prometheus every 15s            │
│           ▼                                                    │
│   ┌────────────────┐                                           │
│   │  MovieLab API  │  Spring Boot + Micrometer                 │
│   │  (:8080)       │  JVM, HTTP, and application metrics      │
│   └────────────────┘                                           │
└────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Micrometer** (embedded in the JVM) collects runtime metrics — heap/non-heap memory, thread states, GC pauses, HTTP request counts and latencies, CPU usage.
2. **Spring Boot Actuator** exposes these metrics at `/actuator/prometheus` in Prometheus text format.
3. **Prometheus** scrapes this endpoint every 15 seconds, stores the data in its local time-series database.
4. **Grafana** queries Prometheus via PromQL and renders the MovieLab Overview dashboard with six pre-configured panels.
5. **Node Exporter** runs alongside and feeds host-level metrics (CPU, memory, disk, network) into Prometheus for infrastructure awareness.

---

## Components

### 1. Backend Instrumentation (`server/`)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Metrics Collection | Micrometer (via `micrometer-registry-prometheus`) | JVM & HTTP instrumentation |
| HTTP Export | Spring Boot Actuator | Exposes `/actuator/prometheus` endpoint |
| Configuration | `application.properties` | Enabled endpoints, app name tagging |

**Endpoints exposed:**

| Endpoint | Content | Used By |
|----------|---------|---------|
| `/actuator/health` | JSON health status (DB, disk, ping) | Load balancers, Docker health checks |
| `/actuator/metrics` | Available metric names | Manual debugging |
| `/actuator/prometheus` | Prometheus-formatted metrics | Prometheus scraper |

### 2. Prometheus (`monitoring/prometheus/`)

The metrics storage layer. Scrapes four targets.

| Job | Target | Interval | Purpose |
|-----|--------|----------|---------|
| `prometheus` | `localhost:9090` | 15s | Prometheus self-metrics |
| `node-exporter` | `node-exporter:9100` | 15s | Host CPU, RAM, disk, network |
| `movielab-api` | `host.docker.internal:8080/actuator/prometheus` | 15s | Application & JVM metrics |
| `movielab-api-production` | `movielab-api.onrender.com` | 60s | Production metrics (optional) |

### 3. Grafana (`monitoring/grafana/`)

The visualization layer. Auto-provisioned at startup — no manual configuration required.

**MovieLab Overview Dashboard — 6 Panels:**

| Panel | Query | What It Reveals |
|-------|-------|-----------------|
| JVM Heap Memory | `jvm_memory_used_bytes{area="heap"}` | Memory leak detection, sizing |
| JVM Non-Heap Memory | `jvm_memory_used_bytes{area="nonheap"}` | Metaspace / class loader issues |
| HTTP Request Rate | `rate(http_server_requests_seconds_count[1m])` | Traffic patterns, usage spikes |
| HTTP Response Latency (P95) | `histogram_quantile(0.95, ...)` | Slow endpoint detection |
| JVM Thread States | `jvm_threads_states_threads{state=~"runnable\|blocked\|waiting"}` | Thread contention, deadlocks |
| CPU Usage | `system_cpu_usage` / `process_cpu_usage` | Resource utilization |

### 4. Node Exporter (`monitoring/docker-compose.yml`)

Exposes Linux host metrics. Runs as a Docker container with read-only mounts to `/proc`, `/sys`, and `/`.

---

## Deployment

### Local Development

```bash
# Terminal 1 — start the backend
cd server && TMDB_API_KEY=<key> ./mvnw spring-boot:run

# Terminal 2 — start monitoring stack
cd monitoring && docker compose up -d
```

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | — |
| Node Exporter | http://localhost:9100 | — |

### Production (Render)

The Prometheus config includes a production job pointing to `movielab-api.onrender.com`. To use it in production, deploy the monitoring stack on a VPS or VM with access to the Render deployment.

---

## CI/CD Integration

`.github/workflows/ci.yml` runs on every push/PR to `main`/`develop`:

- **Backend:** `./mvnw clean package` + `./mvnw test`
- **Frontend:** `npm ci` + `npx tsc --noEmit` + `npm run build`

The CI pipeline ensures the project compiles and tests pass. Monitoring-specific integration tests are not yet included.

---

## Cost

| Component | Cost |
|-----------|------|
| Prometheus | $0 (open source, Apache 2.0) |
| Grafana | $0 (open source, AGPLv3) |
| Node Exporter | $0 (open source, Apache 2.0) |
| Micrometer | $0 (open source, Apache 2.0) |
| Infrastructure | Local Docker resources (~2 GB RAM combined) |

Running the entire stack locally requires Docker and ~2 GB of available memory across the three containers.

---

## What We Can Now Detect

| Scenario | Metric Signal | Panel |
|----------|--------------|-------|
| Memory leak | Heap grows monotonically without GC recovery | JVM Heap Memory |
| Slow endpoint | P95 latency spikes above baseline | HTTP Latency (P95) |
| Traffic surge | Request rate jumps 10x | HTTP Request Rate |
| Thread deadlock | Blocked threads accumulate, runnable threads drop | Thread States |
| CPU exhaustion | CPU usage sustained > 90% | CPU Usage |
| Disk full | Node Exporter disk metrics near capacity | (add future panel) |

---

## Limitations & Future Work

### Current Gaps

| Gap | Impact | Solution Timeline |
|-----|--------|-------------------|
| No alerting | We only see problems when looking at the dashboard | Add Alertmanager for Slack/email/PagerDuty notifications |
| No logging integration | Can't correlate metrics with specific error messages | Add Loki or ELK for log aggregation |
| No distributed tracing | Can't trace requests across service boundaries | Add OpenTelemetry + Jaeger |
| No persistent production deployment | Monitoring stack only runs locally | Deploy on a small VPS or Render cron job |
| No uptime monitoring | Don't know if production is down | Add Grafana Cloud or UptimeRobot |

### Recommended Next Steps (Priority Order)

1. **Set up Alertmanager** — define rules for: heap > 80%, P95 > 2s, request error rate > 5%, CPU > 90%, disk > 85%
2. **Deploy monitoring stack to production** — on a cheap VPS ($5–10/mo) to monitor the Render deployment
3. **Add structured logging** — ship logs to Loki for log-metric correlation
4. **Create a custom business metrics panel** — e.g., "searches per minute", "watchlist additions per day" using Micrometer custom counters

---

## Appendix: PromQL Quick Reference

```promql
# JVM heap usage ratio
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}

# HTTP error rate (5xx / total)
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) 
/ sum(rate(http_server_requests_seconds_count[5m]))

# 95th percentile response time by endpoint
histogram_quantile(0.95, 
  sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri))
```

---

## Conclusion

The monitoring stack provides **production-grade observability at zero licensing cost**. It covers the three key observability pillars:

| Pillar | Covered? | Tool |
|--------|----------|------|
| Metrics | ✅ | Prometheus + Micrometer |
| Logging | ❌ (planned) | Loki |
| Tracing | ❌ (planned) | OpenTelemetry + Jaeger |

The immediate value is **proactive detection** of memory leaks, performance regressions, and resource exhaustion before they impact users.
