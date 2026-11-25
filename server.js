// ============================================================
// server.js  –  Student Record Management API
// ============================================================

const express = require('express');
const app = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────
// Automatically parse incoming JSON request bodies
app.use(express.json());

// ── In-memory data store ──────────────────────────────────────
// This array acts as our "database".
// All changes are lost when the server restarts (that's expected).
let students = [
  { id: 201, rollNumber: 'CSE2401', name: 'Aarav Sharma',  branch: 'CSE', semester: 3, email: 'aarav@example.com' },
  { id: 202, rollNumber: 'ECE2402', name: 'Diya Verma',    branch: 'ECE', semester: 3, email: 'diya@example.com'  },
  { id: 203, rollNumber: 'CSE2403', name: 'Kabir Singh',   branch: 'CSE', semester: 3, email: 'kabir@example.com' }
];

// Keep a counter for generating unique IDs.
// We start just above the highest existing ID.
let nextId = 204;

// ── Helper: Validation ────────────────────────────────────────
// Returns an error message string if validation fails, or null if everything is fine.
function validateStudent(data) {
  const { rollNumber, name, branch, semester, email } = data;

  if (!rollNumber || typeof rollNumber !== 'string' || rollNumber.trim() === '') {
    return 'rollNumber is required and must be a non-empty string.';
  }
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'name is required and must be a non-empty string.';
  }
  if (!branch || typeof branch !== 'string' || branch.trim() === '') {
    return 'branch is required and must be a non-empty string.';
  }
  if (semester === undefined || semester === null) {
    return 'semester is required.';
  }
  if (typeof semester !== 'number' || !Number.isInteger(semester) || semester < 1 || semester > 8) {
    return 'semester must be an integer between 1 and 8.';
  }
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return 'email is required and must be a non-empty string.';
  }
  // Basic e-mail format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'email must be a valid email address.';
  }

  return null; // no error
}

// ── Route 1: GET /api/students ────────────────────────────────
// Return all student records.
app.get('/api/students', (req, res) => {
  res.status(200).json(students);
});

// ── Route 2: GET /api/students/filter ────────────────────────
// IMPORTANT: This route must be defined BEFORE /api/students/:id
// so Express does not treat the word "filter" as an :id parameter.
//
// Filter students by branch (case-insensitive).
// Example: GET /api/students/filter?branch=cse
app.get('/api/students/filter', (req, res) => {
  const { branch } = req.query;

  if (!branch) {
    return res.status(400).json({ error: 'branch query parameter is required. Example: /api/students/filter?branch=CSE' });
  }

  const result = students.filter(
    (s) => s.branch.toLowerCase() === branch.toLowerCase()
  );

  // Return empty array (not 404) when no matches found
  res.status(200).json(result);
});

// ── Route 3: GET /api/students/:id ───────────────────────────
// Find and return a single student by numeric ID.
app.get('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID must be a valid number.' });
  }

  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ error: `Student with ID ${id} not found.` });
  }

  res.status(200).json(student);
});

// ── Route 4: POST /api/students ───────────────────────────────
// Add a new student record.
// Expects JSON body: { rollNumber, name, branch, semester, email }
app.post('/api/students', (req, res) => {
  const error = validateStudent(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const { rollNumber, name, branch, semester, email } = req.body;

  const newStudent = {
    id: nextId++,          // auto-generate unique ID
    rollNumber: rollNumber.trim(),
    name: name.trim(),
    branch: branch.trim(),
    semester,
    email: email.trim()
  };

  students.push(newStudent);

  res.status(201).json(newStudent);
});

// ── Route 5: PUT /api/students/:id ───────────────────────────
// Update an existing student record by ID.
app.put('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID must be a valid number.' });
  }

  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Student with ID ${id} not found.` });
  }

  const error = validateStudent(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const { rollNumber, name, branch, semester, email } = req.body;

  // Update the record (keep the original ID)
  students[index] = {
    id,
    rollNumber: rollNumber.trim(),
    name: name.trim(),
    branch: branch.trim(),
    semester,
    email: email.trim()
  };

  res.status(200).json(students[index]);
});

// ── Route 6: DELETE /api/students/:id ────────────────────────
// Delete a student record by ID.
app.delete('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID must be a valid number.' });
  }

  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Student with ID ${id} not found.` });
  }

  students.splice(index, 1); // remove 1 element at the found position

  res.status(200).json({ message: `Student with ID ${id} has been deleted successfully.` });
});

// ── Start the server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server.');
});
