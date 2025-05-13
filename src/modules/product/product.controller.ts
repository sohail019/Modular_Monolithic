import { Request, Response } from "express";
import * as productService from "./product.service";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
} from "./product.types";
import ProductModel from "./product.schema";
import { CategoryModel } from "./category/category.schema";
import { BrandModel } from "./brand/brand.schema";

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

// export const seedProducts = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     // Seed categories
//     const categories = [
//       {
//         name: "Electronics",
//         slug: "electronics",
//         description: "Electronic items",
//       },
//       {
//         name: "Fashion",
//         slug: "fashion",
//         description: "Clothing and accessories",
//       },
//       {
//         name: "Home Appliances",
//         slug: "home-appliances",
//         description: "Appliances for home use",
//       },
//       { name: "Books", slug: "books", description: "Books and literature" },
//       {
//         name: "Sports",
//         slug: "sports",
//         description: "Sports equipment and gear",
//       },
//     ];
//     await CategoryModel.insertMany(categories);
//     console.log("Categories seeded successfully!");

//     // Seed brands
//     const brands = [
//       {
//         name: "Samsung",
//         logo_url: "https://example.com/samsung-logo.png",
//         description: "Electronics brand",
//       },
//       {
//         name: "Nike",
//         logo_url: "https://example.com/nike-logo.png",
//         description: "Sportswear brand",
//       },
//       {
//         name: "LG",
//         logo_url: "https://example.com/lg-logo.png",
//         description: "Home appliances brand",
//       },
//       {
//         name: "Penguin",
//         logo_url: "https://example.com/penguin-logo.png",
//         description: "Book publisher",
//       },
//       {
//         name: "Adidas",
//         logo_url: "https://example.com/adidas-logo.png",
//         description: "Sportswear brand",
//       },
//     ];
//     await BrandModel.insertMany(brands);
//     console.log("Brands seeded successfully!");

//     // Seed products
//     // const products = await productService.seedProducts();
//     console.log("Products seeded successfully!");

//     res.status(201).json({
//       message: "Categories, brands, and products seeded successfully!",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const seedProducts = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     // Fetch category IDs
//     const categories = await CategoryModel.find({}, "_id").lean();
//     const categoryIds = categories.map((category) => category._id);

//     // Fetch brand IDs
//     const brands = await BrandModel.find({}, "_id").lean();
//     const brandIds = brands.map((brand) => brand._id);

//     if (categoryIds.length === 0 || brandIds.length === 0) {
//       res.status(400).json({
//         message: "Please seed categories and brands before seeding products.",
//       });
//       return;
//     }

//     // Seed products
//     const products = [
//       {
//         name: "Smartphone",
//         slug: "smartphone",
//         description: "A high-quality smartphone.",
//         category_id: categoryIds[0],
//         brand_id: brandIds[0],
//         price: 699,
//         discount_amount: 50,
//         discount_type: "fixed",
//         available_stock: 100,
//         is_available: true,
//       },
//       {
//         name: "Running Shoes",
//         slug: "running-shoes",
//         description: "Comfortable running shoes.",
//         category_id: categoryIds[1],
//         brand_id: brandIds[1],
//         price: 120,
//         discount_amount: 10,
//         discount_type: "percentage",
//         available_stock: 200,
//         is_available: true,
//       },
//       {
//         name: "Microwave Oven",
//         slug: "microwave-oven",
//         description: "A powerful microwave oven.",
//         category_id: categoryIds[2],
//         brand_id: brandIds[2],
//         price: 299,
//         discount_amount: 20,
//         discount_type: "fixed",
//         available_stock: 50,
//         is_available: true,
//       },
//       {
//         name: "Fiction Book",
//         slug: "fiction-book",
//         description: "A best-selling fiction book.",
//         category_id: categoryIds[3],
//         brand_id: brandIds[3],
//         price: 20,
//         discount_amount: 5,
//         discount_type: "fixed",
//         available_stock: 300,
//         is_available: true,
//       },
//       {
//         name: "Basketball",
//         slug: "basketball",
//         description: "A durable basketball.",
//         category_id: categoryIds[4],
//         brand_id: brandIds[4],
//         price: 50,
//         discount_amount: 10,
//         discount_type: "percentage",
//         available_stock: 150,
//         is_available: true,
//       },
//       {
//         name: "Laptop",
//         slug: "laptop",
//         description: "A high-performance laptop.",
//         category_id: categoryIds[0],
//         brand_id: brandIds[0],
//         price: 1200,
//         discount_amount: 100,
//         discount_type: "fixed",
//         available_stock: 80,
//         is_available: true,
//       },
//       {
//         name: "T-Shirt",
//         slug: "t-shirt",
//         description: "A comfortable cotton t-shirt.",
//         category_id: categoryIds[1],
//         brand_id: brandIds[1],
//         price: 25,
//         discount_amount: 5,
//         discount_type: "percentage",
//         available_stock: 500,
//         is_available: true,
//       },
//       {
//         name: "Refrigerator",
//         slug: "refrigerator",
//         description: "A spacious refrigerator.",
//         category_id: categoryIds[2],
//         brand_id: brandIds[2],
//         price: 800,
//         discount_amount: 50,
//         discount_type: "fixed",
//         available_stock: 40,
//         is_available: true,
//       },
//       {
//         name: "Notebook",
//         slug: "notebook",
//         description: "A handy notebook for writing.",
//         category_id: categoryIds[3],
//         brand_id: brandIds[3],
//         price: 5,
//         discount_amount: 1,
//         discount_type: "fixed",
//         available_stock: 1000,
//         is_available: true,
//       },
//       {
//         name: "Football",
//         slug: "football",
//         description: "A durable football.",
//         category_id: categoryIds[4],
//         brand_id: brandIds[4],
//         price: 30,
//         discount_amount: 5,
//         discount_type: "percentage",
//         available_stock: 200,
//         is_available: true,
//       },
//     ];

//     await ProductModel.insertMany(products);
//     console.log("Products seeded successfully!");

//     res.status(201).json({
//       message: "Products seeded successfully!",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
