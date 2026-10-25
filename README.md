# EduTrack – Student Management REST API

Module 3 · Practical 1 — a production-style REST API for managing student academic records, built with **Node.js, Express.js 5 and MySQL 8**.

## Features
- CRUD for students (`GET`, `POST`, `PUT`, `DELETE`) plus search by department
- JWT authentication: only a logged-in **administrator** can manage records
- Passwords stored as **bcrypt** hashes
- Request validation with **Zod** (required fields, email format, semester 1–8, CGPA 0–10)
- Duplicate email prevention (database `UNIQUE` constraint, mapped to `409 Conflict`)
- Pagination on list endpoints
- Security middleware: `helmet`, `cors`, rate limiting, 10 kB body limit
- Central error handling with a consistent JSON response format
- Health check endpoint, request logging, graceful shutdown
- Automated integration tests (Jest + Supertest) and a Postman collection with test scripts

## Tech stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js ≥ 18 |
| Framework | Express.js 5 |
| Database | MySQL 8 (`mysql2` driver, connection pool) |
| Auth | `jsonwebtoken`, `bcryptjs` |
| Validation | `zod` |
| Security | `helmet`, `cors`, `express-rate-limit` |
| Logging | `morgan` |
| Testing | `jest`, `supertest`, Postman / Newman |

## Project structure
```
practical1-student-api/
├── src/
│   ├── app.js                  # Express app: middleware, routes, error handling
│   ├── server.js               # Entry point: DB check, listen, graceful shutdown
│   ├── config/
│   │   ├── env.js              # Loads + validates environment variables
│   │   └── db.js               # MySQL connection pool
│   ├── routes/                 # URL → middleware → controller mapping
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   └── student.routes.js
│   ├── controllers/            # HTTP layer (req/res only)
│   ├── services/               # Business logic + SQL
│   ├── validators/             # Zod schemas
│   ├── middlewares/            # auth, validate, errorHandler
│   └── utils/                  # ApiError, pagination helper
├── database/
│   ├── schema.sql              # Tables, constraints, indexes
│   └── seed.sql                # Sample admin + students
├── scripts/setup-db.js         # Creates DB and loads schema + seed
├── tests/students.test.js      # 26 integration tests
├── postman/EduTrack.postman_collection.json
├── .env.example                # Template for environment variables
└── package.json
```

## Getting started
```bash
# 1. Install MySQL (Mac) and start it
brew install mysql && brew services start mysql

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env        # then edit DB_PASSWORD and JWT_SECRET

# 4. Create database, tables and sample data
npm run db:setup

# 5. Start the server
npm run dev                 # auto-restarts on file changes
# or
npm start
```

Server: `http://localhost:3000`  ·  Health: `http://localhost:3000/health`

**Sample admin login:** `admin@edutrack.edu` / `Admin@123` (development seed only)

## Available scripts
| Command | What it does |
|---------|--------------|
| `npm start` | Start the server |
| `npm run dev` | Start with auto-reload (`node --watch`) |
| `npm run db:setup` | (Re)create tables and load sample data |
| `npm test` | Run the Jest test suite against the `edutrack_test` database |

## API reference
Base URL: `http://localhost:3000/api/v1`. All `/students` routes require the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Success |
|--------|----------|-------------|---------|
| POST | `/auth/login` | Admin login, returns JWT | 200 |
| GET | `/students?page=1&limit=10` | List students (paginated) | 200 |
| GET | `/students/search?department=CSE` | Search by department (sorted by CGPA) | 200 |
| GET | `/students/:id` | Get one student | 200 |
| POST | `/students` | Create a student | 201 |
| PUT | `/students/:id` | Update a student | 200 |
| DELETE | `/students/:id` | Delete a student | 200 |
| GET | `/health` *(no prefix)* | Service + database status | 200 / 503 |

### Request body (POST / PUT)
```json
{
  "name": "Ishaan Gupta",
  "email": "ishaan.gupta@college.edu",
  "department": "CSE",
  "semester": 4,
  "cgpa": 8.4
}
```

### Response format
```json
// success
{ "success": true, "message": "Student created", "data": { ... } }

// list
{ "success": true, "data": [ ... ], "pagination": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 } }

// error
{ "success": false, "message": "Validation failed",
  "errors": [ { "field": "cgpa", "message": "cgpa must be between 0 and 10" } ] }
```

### Status codes
| Code | When |
|------|------|
| 200 | Read / update / delete succeeded |
| 201 | Student created |
| 400 | Validation failed, invalid id, malformed JSON |
| 401 | Missing / invalid / expired token, wrong login |
| 404 | Student or route not found |
| 409 | Email already registered |
| 413 | Request body too large |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error (details hidden outside development) |
| 503 | Health check: database unreachable |

## Testing
**Automated:** `npm test` runs 26 integration tests against a separate `edutrack_test` database (it's reset automatically).

**Postman:** Import `postman/EduTrack.postman_collection.json` → *Run collection*. The login request stores the token automatically; every request has test assertions. Run `npm run db:setup` first for a clean dataset.

## Security notes
- `.env` is git-ignored; only `.env.example` is committed.
- Passwords are hashed with bcrypt (cost 10); plain passwords are never stored.
- All SQL uses parameterized queries (no SQL injection).
- Error responses never leak stack traces or SQL errors outside development.
