// Integration tests: real Express app + real MySQL test database (edutrack_test)
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const setupDatabase = require('../scripts/setup-db');

const API = '/api/v1';
let token;

const newStudent = {
  name: 'Ishaan Gupta',
  email: 'ishaan.gupta@college.edu',
  department: 'cse',
  semester: 4,
  cgpa: 8.4,
};

beforeAll(async () => {
  await setupDatabase(); // fresh schema + seed data before the suite
  const res = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'admin@edutrack.edu', password: 'Admin@123' });
  token = res.body.data.token;
});

afterAll(async () => {
  await pool.end();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe('Health check', () => {
  test('GET /health reports the database is up', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('up');
  });
});

describe('Authentication', () => {
  test('login with correct credentials returns a JWT', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: 'admin@edutrack.edu', password: 'Admin@123' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  test('login with wrong password returns 401', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: 'admin@edutrack.edu', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('login with missing fields returns 400', async () => {
    const res = await request(app).post(`${API}/auth/login`).send({});
    expect(res.status).toBe(400);
  });

  test('student routes without a token return 401', async () => {
    const res = await request(app).get(`${API}/students`);
    expect(res.status).toBe(401);
  });

  test('student routes with a fake token return 401', async () => {
    const res = await request(app).get(`${API}/students`).set('Authorization', 'Bearer fake.token.here');
    expect(res.status).toBe(401);
  });
});

describe('Read students', () => {
  test('GET /students returns a paginated list', async () => {
    const res = await request(app).get(`${API}/students?page=1&limit=2`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toEqual({ page: 1, limit: 2, total: 5, totalPages: 3 });
  });

  test('GET /students/:id returns one student with numeric cgpa', async () => {
    const res = await request(app).get(`${API}/students/1`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Karuna Sharma');
    expect(res.body.data.cgpa).toBe(8.92);
  });

  test('GET /students/999 returns 404', async () => {
    const res = await request(app).get(`${API}/students/999`).set(auth());
    expect(res.status).toBe(404);
  });

  test('GET /students/abc returns 400 (invalid id)', async () => {
    const res = await request(app).get(`${API}/students/abc`).set(auth());
    expect(res.status).toBe(400);
  });

  test('GET /students?limit=500 returns 400 (limit too high)', async () => {
    const res = await request(app).get(`${API}/students?limit=500`).set(auth());
    expect(res.status).toBe(400);
  });
});

describe('Search by department', () => {
  test('search is case-insensitive and sorted by cgpa (desc)', async () => {
    const res = await request(app).get(`${API}/students/search?department=cse`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.map((s) => s.name)).toEqual(['Karuna Sharma', 'Rohan Verma']);
  });

  test('search without department returns 400', async () => {
    const res = await request(app).get(`${API}/students/search`).set(auth());
    expect(res.status).toBe(400);
  });

  test('search with unknown department returns an empty list', async () => {
    const res = await request(app).get(`${API}/students/search?department=CIVIL`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('Create, update and delete', () => {
  let createdId;

  test('POST /students creates a student (201) and normalises data', async () => {
    const res = await request(app).post(`${API}/students`).set(auth()).send(newStudent);
    expect(res.status).toBe(201);
    expect(res.headers.location).toBe(`${API}/students/${res.body.data.student_id}`);
    expect(res.body.data.department).toBe('CSE');
    createdId = res.body.data.student_id;
  });

  test('POST with a duplicate email returns 409', async () => {
    const res = await request(app)
      .post(`${API}/students`)
      .set(auth())
      .send({ ...newStudent, email: 'KARUNA.SHARMA@college.edu' }); // case-insensitive duplicate
    expect(res.status).toBe(409);
  });

  test('POST with missing fields returns 400 listing each field', async () => {
    const res = await request(app).post(`${API}/students`).set(auth()).send({ name: 'Only Name' });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toEqual(['email', 'department', 'semester', 'cgpa']);
  });

  test('POST with out-of-range values returns 400', async () => {
    const res = await request(app)
      .post(`${API}/students`)
      .set(auth())
      .send({ ...newStudent, email: 'range@college.edu', semester: 9, cgpa: 11 });
    expect(res.status).toBe(400);
  });

  test('POST with malformed JSON returns 400', async () => {
    const res = await request(app)
      .post(`${API}/students`)
      .set(auth())
      .set('Content-Type', 'application/json')
      .send('{bad json');
    expect(res.status).toBe(400);
  });

  test('PUT /students/:id updates the student', async () => {
    const res = await request(app)
      .put(`${API}/students/${createdId}`)
      .set(auth())
      .send({ ...newStudent, semester: 5, cgpa: 8.9 });
    expect(res.status).toBe(200);
    expect(res.body.data.semester).toBe(5);
    expect(res.body.data.cgpa).toBe(8.9);
  });

  test("PUT using another student's email returns 409", async () => {
    const res = await request(app)
      .put(`${API}/students/${createdId}`)
      .set(auth())
      .send({ ...newStudent, email: 'diya.iyer@college.edu' });
    expect(res.status).toBe(409);
  });

  test('PUT on a missing student returns 404', async () => {
    const res = await request(app)
      .put(`${API}/students/999`)
      .set(auth())
      .send({ ...newStudent, email: 'nobody@college.edu' });
    expect(res.status).toBe(404);
  });

  test('DELETE /students/:id deletes the student', async () => {
    const res = await request(app).delete(`${API}/students/${createdId}`).set(auth());
    expect(res.status).toBe(200);
  });

  test('GET after delete returns 404', async () => {
    const res = await request(app).get(`${API}/students/${createdId}`).set(auth());
    expect(res.status).toBe(404);
  });

  test('DELETE again returns 404', async () => {
    const res = await request(app).delete(`${API}/students/${createdId}`).set(auth());
    expect(res.status).toBe(404);
  });
});

describe('Unknown routes', () => {
  test('returns 404 JSON', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
