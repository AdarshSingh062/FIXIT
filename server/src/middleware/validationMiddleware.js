const validator = require('validator');
const ApiResponse = require('../utils/apiResponse');

const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, 'Validation error', 400, errors);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, 'Validation error', 400, errors);
  }

  next();
};

const validateComplaint = (req, res, next) => {
  const { title, description, category } = req.body;
  const errors = [];

  if (!title || title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!category) {
    errors.push('Category is required');
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, 'Validation error', 400, errors);
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateComplaint
};
