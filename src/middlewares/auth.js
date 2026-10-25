// Protects routes: the request must carry a valid JWT in the header
//   Authorization: Bearer <token>
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Authentication token is missing'));
  }

  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

module.exports = { authenticate };
