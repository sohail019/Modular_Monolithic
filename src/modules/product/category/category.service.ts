import { CategoryModel } from "./category.schema";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryParams,
} from "./category.types";
import { createSlug } from "../../../utils/helpers";

// Create a new category
export const createCategory = async (categoryData: CreateCategoryDto) => {
  // Generate slug if not provided
  if (!categoryData.slug) {
    categoryData.slug = createSlug(categoryData.name);
  }

  // Check if category with same slug exists
  const existingCategory = await CategoryModel.findOne({
    slug: categoryData.slug,
  });
  if (existingCategory) {
    throw new Error("Category with this slug already exists");
  }

  const category = new CategoryModel(categoryData);
  return await category.save();
};

// Get all categories with filtering/pagination
export const getAllCategories = async (query: CategoryQueryParams = {}) => {
  const { page = 1, limit = 10, sort = "created_at", name } = query;

  const filter: any = {};

  // Apply filters if provided
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  const sortDirection = sort.startsWith("-") ? -1 : 1;
  const sortField = sort.startsWith("-") ? sort.substring(1) : sort;

  const categories = await CategoryModel.find(filter)
    .sort({ [sortField]: sortDirection })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await CategoryModel.countDocuments(filter);

  return {
    categories,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

// Get category by ID
export const getCategoryById = async (id: string) => {
  const category = await CategoryModel.findById(id);
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

// Get category by slug
export const getCategoryBySlug = async (slug: string) => {
  const category = await CategoryModel.findOne({ slug });
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

// Update category by ID
export const updateCategoryById = async (
  id: string,
  updateData: UpdateCategoryDto
) => {
  // If updating the name and no slug provided, generate a new slug
  if (updateData.name && !updateData.slug) {
    updateData.slug = createSlug(updateData.name);
  }

  // If slug is being updated, check if it's already in use
  if (updateData.slug) {
    const existingCategory = await CategoryModel.findOne({
      slug: updateData.slug,
      _id: { $ne: id },
    });

    if (existingCategory) {
      throw new Error("Category with this slug already exists");
    }
  }

  const category = await CategoryModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

// Delete category by ID
export const deleteCategoryById = async (id: string) => {
  const category = await CategoryModel.findByIdAndDelete(id);

  if (!category) {
    throw new Error("Category not found");
  }

  return { message: "Category deleted successfully", id };
};
