import { Request, Response } from "express";
import * as productService from "./product.service";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
} from "./product.types";

// Create a new product
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productData: CreateProductDto = req.body;
    const product = await productService.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all products
export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query: ProductQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sort: (req.query.sort as string) || "created_at",
      name: req.query.name as string,
      min_price: req.query.min_price
        ? parseFloat(req.query.min_price as string)
        : undefined,
      max_price: req.query.max_price
        ? parseFloat(req.query.max_price as string)
        : undefined,
    };

    const products = await productService.getAllProducts(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get product by slug
export const getProductBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get products by category
export const getProductsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category } = req.params;
    const query: ProductQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sort: (req.query.sort as string) || "created_at",
    };

    const products = await productService.getProductsByCategory(
      category,
      query
    );
    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get products by brand
export const getProductsByBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { brand } = req.params;
    const query: ProductQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sort: (req.query.sort as string) || "created_at",
    };

    const products = await productService.getProductsByBrand(brand, query);
    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update product by ID
export const updateProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateProductDto = req.body;
    const product = await productService.updateProductById(id, updateData);
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete product by ID
export const deleteProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await productService.deleteProductById(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Check product availability
export const checkProductAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const availability = await productService.checkProductAvailability(id);
    res.status(200).json(availability);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Search products
export const searchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    const query: ProductQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sort: (req.query.sort as string) || "created_at",
    };

    const products = await productService.searchProducts(q, query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
