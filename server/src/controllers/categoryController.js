const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all active categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const { all } = req.query;
  const query = all === 'true' && req.user?.role === 'admin' ? {} : { isActive: true };

  const categories = await Category.find(query).sort({ name: 1 });
  return ApiResponse.success(res, 'Categories retrieved successfully', categories);
});

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, color, defaultPriority, slaHours, department } = req.body;

  if (!name) {
    return ApiResponse.error(res, 'Category name is required', 400);
  }

  const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingCategory) {
    return ApiResponse.error(res, 'A category with this name already exists', 400);
  }

  const category = await Category.create({
    name,
    description,
    icon,
    color,
    defaultPriority,
    slaHours,
    department
  });

  return ApiResponse.success(res, 'Category created successfully', category, 201);
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin)
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!category) {
    return ApiResponse.error(res, 'Category not found', 404);
  }

  return ApiResponse.success(res, 'Category updated successfully', category);
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const complaintsCount = await Complaint.countDocuments({ category: req.params.id });

  if (complaintsCount > 0) {
    // Soft disable instead of deleting if referenced
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    return ApiResponse.success(res, `Category deactivated because it is linked to ${complaintsCount} complaints`, category);
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return ApiResponse.error(res, 'Category not found', 404);
  }

  return ApiResponse.success(res, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
