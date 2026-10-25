// Data-access layer: the ONLY place that runs SQL for students
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

const COLUMNS = 'student_id, name, email, department, semester, cgpa, created_at, updated_at';

function duplicateEmailError(err, email) {
  if (err.code === 'ER_DUP_ENTRY') {
    return ApiError.conflict(`Email ${email} is already registered`);
  }
  return err;
}

async function findAll({ page, limit }) {
  const offset = (page - 1) * limit;
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM students');
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM students ORDER BY student_id LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return { rows, total };
}

async function findByDepartment({ department, page, limit }) {
  const offset = (page - 1) * limit;
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM students WHERE department = ?',
    [department]
  );
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM students WHERE department = ? ORDER BY cgpa DESC LIMIT ? OFFSET ?`,
    [department, limit, offset]
  );
  return { rows, total };
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${COLUMNS} FROM students WHERE student_id = ?`, [id]);
  return rows[0] || null;
}

async function create({ name, email, department, semester, cgpa }) {
  try {
    const [result] = await pool.query(
      'INSERT INTO students (name, email, department, semester, cgpa) VALUES (?, ?, ?, ?, ?)',
      [name, email, department, semester, cgpa]
    );
    return findById(result.insertId);
  } catch (err) {
    throw duplicateEmailError(err, email);
  }
}

async function update(id, { name, email, department, semester, cgpa }) {
  try {
    const [result] = await pool.query(
      'UPDATE students SET name = ?, email = ?, department = ?, semester = ?, cgpa = ? WHERE student_id = ?',
      [name, email, department, semester, cgpa, id]
    );
    if (result.affectedRows === 0) return null;
    return findById(id);
  } catch (err) {
    throw duplicateEmailError(err, email);
  }
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM students WHERE student_id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findByDepartment, findById, create, update, remove };
