// HTTP layer: reads the request, calls the service, sends the response.
// Express 5 forwards errors from async handlers to the error handler automatically.
const studentService = require('../services/student.service');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');

// GET /api/v1/students?page=1&limit=10
async function getAll(req, res) {
  const { page, limit } = req.validated.query;
  const { rows, total } = await studentService.findAll({ page, limit });
  res.status(200).json({ success: true, data: rows, pagination: buildPagination(page, limit, total) });
}

// GET /api/v1/students/search?department=CSE
async function search(req, res) {
  const { department, page, limit } = req.validated.query;
  const { rows, total } = await studentService.findByDepartment({ department, page, limit });
  res.status(200).json({ success: true, data: rows, pagination: buildPagination(page, limit, total) });
}

// GET /api/v1/students/:id
async function getById(req, res) {
  const { id } = req.validated.params;
  const student = await studentService.findById(id);
  if (!student) throw ApiError.notFound(`Student with id ${id} not found`);
  res.status(200).json({ success: true, data: student });
}

// POST /api/v1/students
async function create(req, res) {
  const student = await studentService.create(req.validated.body);
  res.status(201).location(`/api/v1/students/${student.student_id}`).json({
    success: true,
    message: 'Student created',
    data: student,
  });
}

// PUT /api/v1/students/:id
async function update(req, res) {
  const { id } = req.validated.params;
  const student = await studentService.update(id, req.validated.body);
  if (!student) throw ApiError.notFound(`Student with id ${id} not found`);
  res.status(200).json({ success: true, message: 'Student updated', data: student });
}

// DELETE /api/v1/students/:id
async function remove(req, res) {
  const { id } = req.validated.params;
  const deleted = await studentService.remove(id);
  if (!deleted) throw ApiError.notFound(`Student with id ${id} not found`);
  res.status(200).json({ success: true, message: 'Student deleted' });
}

module.exports = { getAll, search, getById, create, update, remove };
