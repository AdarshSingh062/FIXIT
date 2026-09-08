class ApiResponse {
  static success(res, message = 'Success', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static paginated(res, message = 'Success', data = [], pagination = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination: {
        total: pagination.total || 0,
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalPages: pagination.totalPages || Math.ceil((pagination.total || 0) / (pagination.limit || 10))
      }
    });
  }

  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message
    };
    if (errors) {
      response.errors = errors;
    }
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
