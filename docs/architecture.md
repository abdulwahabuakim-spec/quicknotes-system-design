# QuickNotes Architecture for 1 Million Users

## Functional Requirements
- User registration, login, JWT authentication
- Create note with title (required, max 100 chars) and body optional
- Read notes paginated, sorted by pinned + updated_at desc
- Update note full (PUT) and partial (PATCH) pin/archive/tags
- Delete note soft delete to trash for 30 days then hard delete
- Search notes by title/body full-text and filter by tags
- Organize with tags many-to-many and pin feature
- Real-time sync across devices

## Non-Functional Requirements
- Availability 99.9% (<43 min downtime/month)
- Scalability to 1M registered users, 100k DAU
- Latency p95 <200ms for GET /notes, p95 <300ms for POST /notes
- Durability 99.999999999% no note loss
- Security HTTPS, hashed passwords bcrypt, JWT, rate limiting 100 req/min
- Cost-efficient storage

## Load Estimate for 1 Million Users
- Assumption: 10% DAU = 100,000 daily active users
- Each DAU: 10 reads (list/search/open), 2 writes (create/update/delete)
- Reads per day: 100k * 10 = 1,000,000 reads / 86,400 sec = 11.6 RPS avg, peak 5x = 58 RPS
- Writes per day: 100k * 2 = 200,000 writes / 86,400 = 2.3 WPS avg, peak 5x = 11.5 WPS
- Average note size: title 50B + body 500B + metadata 200B = 750B ~1KB with overhead
- New storage per day: 200k * 1KB = 200 MB/day
- Storage per year: 200 MB * 365 = 73 GB/year raw + index overhead 30% = ~95 GB/year
- For 3 years retention: ~285 GB primary data, 2x with replica = 570 GB total
- Read-heavy ratio 5:1, very manageable.

## Architecture Diagram
