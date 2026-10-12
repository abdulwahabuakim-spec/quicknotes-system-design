# QuickNotes System Design - Scale to 1M Users

## Requirements
- Functional: Create note, GET notes, Update, Delete, Search, Auth
- Non-Functional: 1M DAU, 100:1 read:write, 99.9% availability
- Performance: GET p95 <150ms, POST p95 <300ms
- Durability: No data loss

## Capacity Planning - 1M DAU (Your math was praised!)
- DAU: 1,000,000
- Avg notes per user per day: 2 notes
- Writes per day: 2,000,000 notes/day
- Write RPS: 2M / 86400 = 23.1 avg, peak 5x = 115 RPS
- Reads per user per day: 50 feed views (100:1 read ratio includes search/list)
- Read RPS: 50M / 86400 = 578.7 avg, peak 5x = 2893 RPS
- Avg note size: 500 bytes text + metadata 200 bytes = 700 bytes
- Storage per day: 2M * 700B = 1.4GB/day
- Storage per year: 1.4GB * 365 = 511GB/year + indexes ~600GB/year
- DB can handle metadata easily, no need for S3 for text notes.

## Architecture Diagram

## Component Definitions
- Client index.html + api.js: Browser app that validates title before request, uses textContent to prevent XSS, manages pending/success/error states for UX.
- CDN CloudFront: Caches GET responses at edge for 60s, offloads 80% of 2893 RPS read traffic.
- Load Balancer ALB: Distributes traffic to 3+ healthy app servers across 2 AZs, avoids single server overload, terminates SSL.
- App Server: Stateless API, handles auth JWT, validates input, writes to primary DB, reads from replica/cache, enqueues jobs to queue.
- Cache Redis: Stores hot notes GET /api/notes?userId=123 with 60s TTL, stores session tokens, reduces DB hits for 100:1 read ratio. Role: speed up GET <150ms.
- Queue SQS + Worker: Decouples slow tasks like search index update and notification email from POST request, returns 201 immediately, worker retries on failure. Role: async processing for POST p95 <300ms.
- Primary DB Postgres: Source of truth for notes table with UUID PK, handles all writes POST/PUT/DELETE with ACID.
- Read Replica: Serves GET queries, scales reads horizontally, offloads primary for 1M users.

## Step-by-Step GET Request Path
1. User opens QuickNotes -> index.html calls api.js GET /api/notes
2. Browser -> DNS -> CDN checks edge cache for GET /api/notes?user=123
3. Hit -> return 150ms from edge
4. Miss -> ALB -> selects healthy App Server 2 via round-robin
5. App Server checks Redis GET notes:user:123, if hit -> return 30ms
6. Redis miss -> query Read Replica: SELECT * FROM notes WHERE user_id=$1 ORDER BY updated_at DESC
7. App writes result to Redis SETEX 60s and returns JSON to client
8. Client uses textContent to render safely, updates status element to success.

## Step-by-Step POST Request Path (Create Note)
1. User types title + body, clicks Save
2. api.js validates: if title.trim().length==0 -> show error, abort (client validation)
3. Set status element to pending, disable button
4. Call fetch POST /api/notes with {title, body, user_id} + JWT header via reusable request wrapper that checks response.ok
5. CDN -> ALB -> App Server 1
6. App Server validates auth, sanitizes input, INSERT INTO notes (id uuid, user_id, title, body) INTO Primary DB
7. On DB success, App Server enqueues SQS message {type:'index', note_id, user_id} for async search indexing
8. App Server invalidates Redis DEL notes:user:123
9. App Server returns 201 Created {id, title, body} immediately <300ms
10. SQS Worker picks job, updates search index, ACKs. If fails, retries.
11. Client receives 201, uses textContent to add to DOM, status -> success. If network error -> status error + retry.

## Single Point of Failure Breakdown
- App Servers: 3+ across AZs behind ALB, if one dies ALB removes it, no SPOF.
- ALB: AWS managed multi-AZ, not single EC2.
- Primary DB: RDS Multi-AZ with auto-failover 60s, daily snapshots, no SPOF.
- Read Replica: 2 replicas, if one fails other serves GET.
- Redis: Cluster with replica + Sentinel, fallback to DB if cache down.
- SQS Queue: Managed multi-AZ persistent, job stays if worker dies.
- CDN: CloudFront global, no SPOF.

## Trade-offs
- Read Replica vs Cache: Replica scales DB reads but 50ms slower than Redis 5ms. Using both gives best.
- Sync vs Async indexing: Async via queue makes POST fast but search may be stale 1-2s.
