# Student Record Management API

A simple REST API built with **Node.js** and **Express.js** to manage student records. Data is stored in an in-memory JavaScript array (no database required).

---

## Project Structure

```
student-record-management-api/
├── server.js       ← Main application file (all routes & logic)
├── package.json    ← Project metadata and dependencies
├── .gitignore      ← Excludes node_modules from Git
└── README.md       ← This file
```

---

## Installation & Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
npm start
```

The server starts at: **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint                          | Description                      |
|--------|-----------------------------------|----------------------------------|
| GET    | /api/students                     | Get all students                 |
| POST   | /api/students                     | Add a new student                |
| GET    | /api/students/:id                 | Get a student by ID              |
| PUT    | /api/students/:id                 | Update a student by ID           |
| DELETE | /api/students/:id                 | Delete a student by ID           |
| GET    | /api/students/filter?branch=value | Filter students by branch        |

---

## Example Requests (using curl)

### GET all students
```bash
curl http://localhost:3000/api/students
```

### POST – Add a new student
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d "{\"rollNumber\": \"IT2404\", \"name\": \"Riya Patel\", \"branch\": \"IT\", \"semester\": 4, \"email\": \"riya@example.com\"}"
```

### GET a student by ID
```bash
curl http://localhost:3000/api/students/201
```

### PUT – Update a student
```bash
curl -X PUT http://localhost:3000/api/students/201 \
  -H "Content-Type: application/json" \
  -d "{\"rollNumber\": \"CSE2401\", \"name\": \"Aarav Sharma\", \"branch\": \"CSE\", \"semester\": 4, \"email\": \"aarav.updated@example.com\"}"
```

### DELETE a student
```bash
curl -X DELETE http://localhost:3000/api/students/202
```

### GET – Filter by branch (case-insensitive)
```bash
curl "http://localhost:3000/api/students/filter?branch=cse"
curl "http://localhost:3000/api/students/filter?branch=CSE"
curl "http://localhost:3000/api/students/filter?branch=MECH"
```

---

## HTTP Status Codes Used

| Code | Meaning                              |
|------|--------------------------------------|
| 200  | OK – Request successful              |
| 201  | Created – New record added           |
| 400  | Bad Request – Invalid input          |
| 404  | Not Found – Student ID not found     |

---

## Validation Rules

| Field      | Rule                                      |
|------------|-------------------------------------------|
| rollNumber | Required, non-empty string                |
| name       | Required, non-empty string                |
| branch     | Required, non-empty string                |
| semester   | Required, integer between 1 and 8        |
| email      | Required, valid email format              |

---

## Initial Data

The server starts with these three records:

```json
[
  { "id": 201, "rollNumber": "CSE2401", "name": "Aarav Sharma", "branch": "CSE", "semester": 3, "email": "aarav@example.com" },
  { "id": 202, "rollNumber": "ECE2402", "name": "Diya Verma",   "branch": "ECE", "semester": 3, "email": "diya@example.com"  },
  { "id": 203, "rollNumber": "CSE2403", "name": "Kabir Singh",  "branch": "CSE", "semester": 3, "email": "kabir@example.com" }
]
```

---

## Notes

- Data is **not persisted** between server restarts (in-memory only).
- IDs are auto-generated starting from 204 for new records.
- Branch filtering is **case-insensitive**.
