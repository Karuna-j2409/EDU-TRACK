const { z } = require('zod');

// Friendly "is required" vs "wrong type" messages
const typeError = (field, type) => (issue) =>
  issue.input === undefined ? `${field} is required` : `${field} must be ${type}`;

// Body for POST /students and PUT /students/:id
const studentSchema = z.object({
  name: z
    .string({ error: typeError('name', 'text') })
    .trim()
    .min(2, 'name must have at least 2 characters')
    .max(100, 'name must be at most 100 characters'),
  email: z
    .string({ error: typeError('email', 'text') })
    .trim()
    .toLowerCase()
    .max(100, 'email must be at most 100 characters')
    .pipe(z.email('email format is invalid')),
  department: z
    .string({ error: typeError('department', 'text') })
    .trim()
    .min(2, 'department must have at least 2 characters')
    .max(50, 'department must be at most 50 characters')
    .toUpperCase(),
  semester: z
    .number({ error: typeError('semester', 'a number') })
    .int('semester must be a whole number')
    .min(1, 'semester must be between 1 and 8')
    .max(8, 'semester must be between 1 and 8'),
  cgpa: z
    .number({ error: typeError('cgpa', 'a number') })
    .min(0, 'cgpa must be between 0 and 10')
    .max(10, 'cgpa must be between 0 and 10'),
});

// :id in the URL
const idParamSchema = z.object({
  id: z.coerce
    .number({ error: 'id must be a number' })
    .int('id must be a whole number')
    .positive('id must be a positive number'),
});

// ?page=1&limit=10
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'page must be 1 or more').default(1),
  limit: z.coerce.number().int().min(1, 'limit must be 1 or more').max(100, 'limit can be at most 100').default(10),
});

// ?department=CSE&page=1&limit=10
const searchSchema = paginationSchema.extend({
  department: z
    .string({ error: 'department query parameter is required' })
    .trim()
    .min(1, 'department query parameter is required')
    .toUpperCase(),
});

module.exports = { studentSchema, idParamSchema, paginationSchema, searchSchema };
