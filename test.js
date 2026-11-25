// test.js  –  Tests every endpoint of the Student Record Management API
// Run AFTER the server is started: node test.js

const http = require('http');

let passed = 0;
let failed = 0;

// ── Helper: make an HTTP request 
function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(data) });
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}
// ── Helper: assert and log result ────────────────────────────
function check(label, condition, details) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${label}`);
    if (details) console.log('     →', JSON.stringify(details));
    failed++;
  }
}

// ── Run all tests ─────────────────────────────────────────────
async function runTests() {
  console.log('\n════════════════════════════════════════════════');
  console.log('  Student Record Management API – Test Suite');
  console.log('════════════════════════════════════════════════\n');

  // TEST 1: GET /api/students – should return 3 initial records
  console.log('1. GET /api/students (all records)');
  const t1 = await request('GET', '/api/students', null);
  check('HTTP 200', t1.status === 200, t1);
  check('Returns array', Array.isArray(t1.body), t1.body);
  check('Contains 3 initial records', t1.body.length === 3, t1.body);

  // TEST 2: POST /api/students – add a valid student
  console.log('\n2. POST /api/students (add valid student)');
  const newStudent = { rollNumber: 'IT2404', name: 'Riya Patel', branch: 'IT', semester: 4, email: 'riya@example.com' };
  const t2 = await request('POST', '/api/students', newStudent);
  check('HTTP 201', t2.status === 201, t2);
  check('ID is a number', typeof t2.body.id === 'number', t2.body);
  check('name matches', t2.body.name === 'Riya Patel', t2.body);
  const newId = t2.body.id;

  // TEST 3: POST /api/students – invalid body (missing fields)
  console.log('\n3. POST /api/students (missing fields → 400)');
  const t3 = await request('POST', '/api/students', { name: 'No Fields' });
  check('HTTP 400', t3.status === 400, t3);
  check('error message present', typeof t3.body.error === 'string', t3.body);

  // TEST 4: POST /api/students – invalid semester
  console.log('\n4. POST /api/students (semester out of range → 400)');
  const t4 = await request('POST', '/api/students', { rollNumber: 'XX001', name: 'Bad', branch: 'XX', semester: 10, email: 'bad@example.com' });
  check('HTTP 400', t4.status === 400, t4);

  // TEST 5: POST /api/students – invalid email
  console.log('\n5. POST /api/students (bad email → 400)');
  const t5 = await request('POST', '/api/students', { rollNumber: 'XX002', name: 'BadEmail', branch: 'XX', semester: 2, email: 'not-an-email' });
  check('HTTP 400', t5.status === 400, t5);

  // TEST 6: GET /api/students/:id – found
  console.log('\n6. GET /api/students/201 (existing ID)');
  const t6 = await request('GET', '/api/students/201', null);
  check('HTTP 200', t6.status === 200, t6);
  check('ID is 201', t6.body.id === 201, t6.body);
  check('name is Aarav Sharma', t6.body.name === 'Aarav Sharma', t6.body);

  // TEST 7: GET /api/students/:id – not found
  console.log('\n7. GET /api/students/9999 (non-existent ID → 404)');
  const t7 = await request('GET', '/api/students/9999', null);
  check('HTTP 404', t7.status === 404, t7);
  check('error message present', typeof t7.body.error === 'string', t7.body);

  // TEST 8: GET /api/students/:id – invalid (non-numeric)
  console.log('\n8. GET /api/students/abc (non-numeric ID → 400)');
  const t8 = await request('GET', '/api/students/abc', null);
  check('HTTP 400', t8.status === 400, t8);

  // TEST 9: PUT /api/students/:id – valid update
  console.log('\n9. PUT /api/students/201 (valid update)');
  const updatedData = { rollNumber: 'CSE2401', name: 'Aarav Sharma Updated', branch: 'CSE', semester: 5, email: 'aarav.new@example.com' };
  const t9 = await request('PUT', '/api/students/201', updatedData);
  check('HTTP 200', t9.status === 200, t9);
  check('name updated', t9.body.name === 'Aarav Sharma Updated', t9.body);
  check('semester updated to 5', t9.body.semester === 5, t9.body);
  check('ID unchanged', t9.body.id === 201, t9.body);

  // TEST 10: PUT /api/students/:id – not found
  console.log('\n10. PUT /api/students/9999 (non-existent → 404)');
  const t10 = await request('PUT', '/api/students/9999', updatedData);
  check('HTTP 404', t10.status === 404, t10);

  // TEST 11: PUT /api/students/:id – invalid data
  console.log('\n11. PUT /api/students/202 (invalid data → 400)');
  const t11 = await request('PUT', '/api/students/202', { name: '' });
  check('HTTP 400', t11.status === 400, t11);

  // TEST 12: DELETE /api/students/:id – found
  console.log('\n12. DELETE /api/students/' + newId + ' (delete newly added)');
  const t12 = await request('DELETE', `/api/students/${newId}`, null);
  check('HTTP 200', t12.status === 200, t12);
  check('success message present', typeof t12.body.message === 'string', t12.body);

  // TEST 13: DELETE /api/students/:id – confirm deletion
  console.log('\n13. GET /api/students/' + newId + ' (confirm deletion → 404)');
  const t13 = await request('GET', `/api/students/${newId}`, null);
  check('HTTP 404 after delete', t13.status === 404, t13);

  // TEST 14: DELETE /api/students/:id – not found
  console.log('\n14. DELETE /api/students/9999 (non-existent → 404)');
  const t14 = await request('DELETE', '/api/students/9999', null);
  check('HTTP 404', t14.status === 404, t14);

  // TEST 15: GET /api/students/filter?branch=CSE (uppercase)
  console.log('\n15. GET /api/students/filter?branch=CSE');
  const t15 = await request('GET', '/api/students/filter?branch=CSE', null);
  check('HTTP 200', t15.status === 200, t15);
  check('Returns array', Array.isArray(t15.body), t15.body);
  check('All results are CSE', t15.body.every(s => s.branch === 'CSE'), t15.body);
  check('2 CSE students found', t15.body.length === 2, t15.body);

  // TEST 16: GET /api/students/filter?branch=cse (lowercase – case-insensitive)
  console.log('\n16. GET /api/students/filter?branch=cse (lowercase)');
  const t16 = await request('GET', '/api/students/filter?branch=cse', null);
  check('HTTP 200', t16.status === 200, t16);
  check('Same 2 results as uppercase', t16.body.length === 2, t16.body);

  // TEST 17: GET /api/students/filter?branch=MECH (no matches)
  console.log('\n17. GET /api/students/filter?branch=MECH (no matches)');
  const t17 = await request('GET', '/api/students/filter?branch=MECH', null);
  check('HTTP 200', t17.status === 200, t17);
  check('Returns empty array', Array.isArray(t17.body) && t17.body.length === 0, t17.body);

  // ── Summary ───────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('════════════════════════════════════════════════\n');

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch((err) => {
  console.error('\n❌ Could not connect to server. Is it running?\n', err.message);
  process.exit(1);
});
