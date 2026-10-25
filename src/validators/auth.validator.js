const { z } = require('zod');

const loginSchema = z.object({
  email: z
    .string({ error: 'email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('email format is invalid')),
  password: z.string({ error: 'password is required' }).min(1, 'password is required'),
});

module.exports = { loginSchema };
