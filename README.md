# Task Manager REST API

A small REST API for managing tasks — built as a teaching project for API
thinking: payloads, status codes, validation, and database structure.

**Stack:** Node.js · Express · MongoDB Atlas (via Mongoose)

---

## Getting started

### Prerequisites
- Node.js 18+ (uses the built-in `--watch` flag)
- A MongoDB Atlas connection string

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Create your environment file and fill in real values
cp .env.example .env
#    - PORT          (defaults to 5000 if unset; .env.example uses 5001)
#    - MONGODB_URI   (your Atlas connection string)

# 3. Run
npm run dev     # auto-restarts on file changes
npm start       # plain start
```

Server runs at `http://localhost:5001` (or whatever `PORT` you set).

---

## Conventions

### Base URL
```
http://localhost:5001/api
```

### Response envelope
Every response uses the same shape, so clients can rely on it:

```jsonc
// success
{ "success": true, "data": { /* ... */ }, "count": 3 }   // count only on lists

// error
{ "success": false, "message": "What went wrong" }
```

Validation errors add a per-field `errors` array:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "A task must have a title" }]
}
```

### Status codes
| Code | Meaning |
|------|---------|
| 200  | OK — request succeeded |
| 201  | Created — a new task was made |
| 400  | Bad request — invalid body, bad id, or malformed JSON |
| 404  | Not found — no task with that id, or unknown route |
| 409  | Conflict — duplicate value on a unique field |
| 500  | Server error — something unexpected broke |

---

## The Task object

| Field         | Type    | Required | Default    | Notes |
|---------------|---------|----------|------------|-------|
| `title`       | string  | yes      | —          | trimmed, 1–120 chars |
| `description` | string  | no       | `""`       | trimmed, ≤ 2000 chars |
| `status`      | string  | no       | `todo`     | `todo` · `in-progress` · `completed` |
| `priority`    | string  | no       | `medium`   | `low` · `medium` · `high` |
| `dueDate`     | date    | no       | `null`     | ISO 8601 date string |
| `_id`         | string  | auto     | —          | MongoDB ObjectId |
| `createdAt`   | date    | auto     | —          | set on create |
| `updatedAt`   | date    | auto     | —          | updated on every change |

Only `title`, `description`, `status`, `priority`, and `dueDate` can be set from
a request body — anything else (e.g. `_id`, `createdAt`) is ignored.

---

## Endpoints

| Method      | Path             | Description            |
|-------------|------------------|------------------------|
| GET         | `/api/health`    | Health check           |
| POST        | `/api/tasks`     | Create a task          |
| GET         | `/api/tasks`     | List tasks (filterable)|
| GET         | `/api/tasks/:id` | Get one task           |
| PUT / PATCH | `/api/tasks/:id` | Update a task          |
| DELETE      | `/api/tasks/:id` | Delete a task          |

---

### Health check
```
GET /api/health
```
```json
{ "success": true, "message": "API is running" }
```

---

### Create a task
```
POST /api/tasks
Content-Type: application/json
```
Request body:
```json
{ "title": "Write the README", "priority": "high", "dueDate": "2026-07-01" }
```
`201 Created`:
```json
{
  "success": true,
  "message": "Task created",
  "data": {
    "_id": "6a3babd0168b13d3e1d7b3a5",
    "title": "Write the README",
    "description": "",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-07-01T00:00:00.000Z",
    "createdAt": "2026-06-24T10:00:00.000Z",
    "updatedAt": "2026-06-24T10:00:00.000Z"
  }
}
```

```bash
curl -X POST localhost:5001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write the README","priority":"high"}'
```

---

### List tasks
```
GET /api/tasks
```
Optional filters (combine freely):
- `?status=todo|in-progress|completed`
- `?priority=low|medium|high`

Returns newest first. `200 OK`:
```json
{ "success": true, "count": 1, "data": [ /* tasks */ ] }
```

```bash
curl localhost:5001/api/tasks
curl "localhost:5001/api/tasks?status=todo&priority=high"
```

---

### Get one task
```
GET /api/tasks/:id
```
`200 OK` with the task, or `404` if no task has that id.

```bash
curl localhost:5001/api/tasks/6a3babd0168b13d3e1d7b3a5
```

---

### Update a task
```
PUT   /api/tasks/:id      # PUT and PATCH behave the same
PATCH /api/tasks/:id
Content-Type: application/json
```
Send only the fields you want to change (partial update):
```json
{ "status": "completed" }
```
`200 OK`:
```json
{ "success": true, "message": "Task updated", "data": { /* updated task */ } }
```

```bash
curl -X PATCH localhost:5001/api/tasks/6a3babd0168b13d3e1d7b3a5 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

---

### Delete a task
```
DELETE /api/tasks/:id
```
`200 OK`, returns the deleted task:
```json
{ "success": true, "message": "Task deleted", "data": { /* deleted task */ } }
```

```bash
curl -X DELETE localhost:5001/api/tasks/6a3babd0168b13d3e1d7b3a5
```

---

## Error examples

Missing title → `400`:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "A task must have a title" }]
}
```

Bad id → `400`:
```json
{ "success": false, "message": "Invalid task id: abc" }
```

Unknown id → `404`:
```json
{ "success": false, "message": "No task found with id 6a3babd0168b13d3e1d7b3a5" }
```

Unknown route → `404`:
```json
{ "success": false, "message": "Route not found: GET /api/nope" }
```

---

## Project structure
```
src/
├── app.js                       # Express app: middleware, routes, error handling
├── server.js                    # Connects to DB, then starts listening
├── config/
│   └── db.js                    # MongoDB connection
├── models/
│   └── Task.js                  # Task schema + validation rules
├── controllers/
│   └── taskController.js        # One handler per CRUD action
├── routes/
│   └── taskRoutes.js            # Maps HTTP methods to controllers
├── middleware/
│   └── validateObjectId.js      # Rejects malformed :id early (400)
└── utils/
    ├── asyncHandler.js          # Forwards async errors to the error handler
    └── AppError.js              # Error class carrying an HTTP status
```
