# QuickNotes API Design
Base URL: /api/v1

## Endpoints

1. GET /notes - List user's notes paginated - 200 OK
2. GET /notes/{id} - Get single note - 200 OK
3. POST /notes - Create new note - 201 Created
4. PUT /notes/{id} - Full update - 200 OK
5. PATCH /notes/{id} - Partial update - 200 OK
6. DELETE /notes/{id} - Soft delete - 204 No Content
7. GET /notes/search?q=&tag= - Search - 200 OK

## Create Example
Request:
POST /notes
{ "title": "Meeting Notes", "body": "Q2 roadmap", "tags": ["work"], "is_pinned": false }

Response 201:
{ "id": "note_9f8b", "user_id": "user_123", "title": "Meeting Notes", "body": "Q2 roadmap", "created_at": "2026-10-12T12:00:00Z" }

## List Example
GET /notes?limit=20
Response 200:
{ "notes": [{ "id": "note_9f8b", "title": "Meeting", "body": "...", "tags": ["work"] }], "total": 128, "limit": 20, "has_more": true }

## Error Codes
400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

Error body example:
{ "error": { "code": "VALIDATION_ERROR", "message": "Title is required and must be at most 100 chars", "details": { "field": "title" } } }
