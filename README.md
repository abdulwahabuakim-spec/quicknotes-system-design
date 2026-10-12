# QuickNotes System Design

Scalable notes app built to handle 1 million users. Proves frontend can talk to API (using JSONPlaceholder practice API) and provides design docs for backend team to build real service.

## Description
QuickNotes moves from browser-only notes to real online service that stays online for 1M users. Features: create/list/delete notes, tags many-to-many, search, pin/archive, auth-ready JWT. Current demo uses https://jsonplaceholder.typicode.com/posts as practice API to prove GET/POST/DELETE flow before real backend exists.

## How to Run the API Client
1. Clone repo:
   git clone https://github.com/abdulwahabuakim-spec/quicknotes-system-design.git
   cd quicknotes-system-design

2. Run locally (no build needed):
   Option A: Just open index.html in browser
   Option B: npx serve .
   Option C: python -m http.server 8000 -> open http://localhost:8000

3. Test features:
   - Click Load notes button -> GET https://jsonplaceholder.typicode.com/posts?_limit=10, shows Loading notes... then Loaded 10 notes from the server. with title/body
   - Fill Title (required, max 100 chars) + Body optional + click Create Note -> POST, validates title, disables button while request runs, shows Note created (status 201, id 101). and adds note to top with textContent only
   - Click Delete on any note -> DELETE request, disables button, shows deleted status
   - Empty state: If no notes, shows No notes yet message
   - Error handling: If offline, shows friendly error in status

## Documentation Links
- [API Design](./docs/api-design.md) - 7 REST endpoints with method, path, description, success status, request/response JSON for create and list, error codes 400 401 403 404 500 with example error body
- [Data Model](./docs/data-model.md) - entities users, notes, tags, note_tags with columns, types, PK, FK, relationships one-to-many and many-to-many, CREATE TABLE for 4 tables, 3+ SQL queries including JOIN, indexes with reason, SQL vs NoSQL justification
- [Architecture](./docs/architecture.md) - functional and non-functional requirements, load estimate for 1M users reads per second writes per second storage per year (11.6 RPS read 2.3 RPS write ~95GB/year), diagram including client DNS CDN load balancer two+ app servers cache primary DB with read replica queue with worker, component roles, GET/notes and POST/notes flows, 2 trade-offs, SPOF avoidance

## What I Learned

1. Frontend reliability patterns matter even with mock API: Reusable async request() wrapper that checks response.ok and throws, try/catch/finally around every request, loading/success/error/empty states shown on page, validation title required max 100 chars, disabling buttons while requests running, and using textContent only not innerHTML to prevent XSS are critical for production UX.

2. Designing for 1M users changes architecture completely: At 100k DAU we get only 11.6 RPS read avg 58 peak and 2.3 WPS write avg, storage 95GB/year looks small but you need CDN for static assets close to users, Load Balancer for distributing to 2+ app servers, Redis cache for hot note lists 80% hit rate, Primary DB for writes + Read Replica for reads, and Queue + Worker for async search indexing to keep p95 latency <200ms.

3. Data modeling trade-offs are real: Many-to-many tags need junction table note_tags with composite PK (note_id, tag_id) to prevent duplicates; indexing (user_id, updated_at DESC) WHERE deleted_at IS NULL makes main feed query index-only scan; SQL PostgreSQL beats NoSQL here because we need ACID for creating note+tags atomically, FK integrity to avoid orphan notes, and JOINs for tag filtering and counts per tag.

4. SPOF and trade-offs thinking: Cache-aside is simpler than write-through but has miss penalty; SQL replica has lag so need read-your-writes mitigation; using managed services ALB, RDS Multi-AZ, SQS, CloudFront, Route53 avoids single points of failure, and queue makes POST fast at cost of eventual consistency for search.

## Live Demo
After enabling GitHub Pages (Settings -> Pages -> main / root): https://abdulwahabuakim-spec.github.io/quicknotes-system-design/

## Author
Built as PLP Project 2 - Day 7/8 Capstone - abdulwahabuakim-spec - Presentation ready for Day 8
