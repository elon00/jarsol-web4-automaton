# JARSOL MONITORING, LOGGING & TELEMETRY SPECIFICATION

> **Standard**: Production Observability & Zero-Leak Audit Logging  
> **Status**: APPROVED  
> **Scope**: Express Backend, PQC Operations, Solana RPC Integration

---

## 1. Structured Logging Format (RFC 5424 / JSON)

All backend events and security transactions emit structured JSON logs to `stdout`/`stderr`:

```json
{
  "timestamp": "2026-09-06T18:00:00.000Z",
  "level": "INFO",
  "component": "PQC_SECURITY_GATEWAY",
  "event": "HYBRID_KEYPAIR_GENERATED",
  "algorithm": "HYBRID_ED25519_ML_DSA65",
  "securityLevel": 3,
  "executionTimeMs": 1.45,
  "realityTag": "SIMULATION_OFFCHAIN",
  "sanitized": true
}
```

### Mandatory Log Attributes:
* `timestamp`: ISO-8601 UTC timestamp.
* `level`: `DEBUG`, `INFO`, `WARN`, `ERROR`, `CRITICAL`.
* `component`: Microservice or subsystem generating the event.
* `event`: Structured event identifier (uppercase snake-case).
* `realityTag`: Explicitly flags whether the event was `REAL_ONCHAIN`, `REAL_CLASSICAL`, `SIMULATION_OFFCHAIN`, or `PREVIEW`.
* `sanitized`: Boolean proving zero private keys, seeds, or confidential payloads are logged.

---

## 2. Health & Readiness Telemetry Endpoint

The `/api/health` endpoint serves continuous readiness probes:

* **Endpoint**: `GET /api/health`
* **Response Payload**:
  * `status`: `ONLINE` | `DEGRADED` | `OFFLINE`
  * `solanaRpc`: Current active RPC cluster URL
  * `solanaVersion`: Active Solana node release version
  * `solanaSlot`: Current finalized slot number
  * `reality`: Fine-grained capability matrix declaring verification state of each subsystem.

---

## 3. Anomaly & Alert Triggers

| Anomaly Indicator | Trigger Threshold | Recommended Alert Action |
|---|---|---|
| **RPC Latency Spike** | Roundtrip > 2500ms for 3 consecutive polls | Issue Slack/PagerDuty warning; query fallback RPC. |
| **Slot Lag** | Slot difference > 50 slots behind cluster tip | Flag RPC desynchronization; restart connection. |
| **Failed PQC Envelope Verification** | > 5 failures per minute from single IP | Rate-limit caller IP; log potential replay attack. |
| **Unauthorized Mint Attempt** | Any non-null mint authority call | CRITICAL alert; on-chain program will reject (authority is null). |

---

## 4. Zero-Leak Sanitization Policy

Under NO circumstances will:
- Private key bytes (Base58 or Uint8Array)
- User wallet seed phrases
- Gemini API keys
- Raw unencrypted user trade intents
be emitted to persistent logs or browser console streams.
