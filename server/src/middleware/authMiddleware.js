const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { USER_STATUS } = require('../config/constants');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return ApiResponse.error(res, 'Not authorized to access this resource. Please log in.', 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fixit_super_secure_jwt_secret_key_2026_production_ready'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return ApiResponse.error(res, 'User account associated with this token no longer exists', 401);
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      return ApiResponse.error(res, 'Your account has been suspended. Please contact municipal support.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Authentication token is invalid or has expired', 401);
  }
});

module.exports = {
  protect
};
