# QuickNotes API Design

Base URL: /api/v1
Auth: Bearer JWT Token

## Error Format - For ALL errors
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
{
  "success": true,
  "data": {}
}
{ "email": "test@test.com", "password": "12345678" }
{ "success": true, "data": { "id": "uuid", "email": "test@test.com", "token": "jwt_token" } }
{ "email": "test@test.com", "password": "12345678" }
{ "success": true, "data": { "token": "jwt_token" } }
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Invalid password" } }
{
  "success": true,
  "data": [
    { "id": "uuid", "title": "My Note", "content": "Hello", "created_at": "2026-10-16" }
  ]
}
{ "title": "New Note", "content": "This is content", "tag_ids": ["tag-uuid"] }
{ "success": true, "data": { "id": "new-uuid", "title": "New Note" } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Title is required" } }
{ "success": true, "data": { "id": "uuid", "title": "My Note", "content": "Full content", "tags": [{"id": "uuid", "name": "work"}] } }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Note not found" } }
{ "title": "Updated", "content": "Updated content" }
{ "success": true, "data": { "id": "uuid", "title": "Updated" } }
{ "success": true, "data": { "message": "Note deleted" } }
{ "success": true, "data": [{ "id": "uuid", "name": "work" }] }
{ "name": "personal" }