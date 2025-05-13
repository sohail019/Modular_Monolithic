import { Request, Response } from "express";
import * as categoryService from "./category.service";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryParams,
} from "./category.types";

// Create a new category
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categoryData: CreateCategoryDto = req.body;
    const category = await categoryService.createCategory(categoryData);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all categories
export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query: CategoryQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort: req.query.sort as string,
      name: req.query.name as string,
    };

    const categories = await categoryService.getAllCategories(query);
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    res.status(200).json(category);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get category by slug
export const getCategoryBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    res.status(200).json(category);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update category by ID
export const updateCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateCategoryDto = req.body;
    const category = await categoryService.updateCategoryById(id, updateData);
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete category by ID
export const deleteCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await categoryService.deleteCategoryById(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
