import { Request, Response } from "express";
import * as productService from "./product.service";
import { products } from "../../products_seed_data_300";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
} from "./product.types";
import ProductModel from "./product.schema";
import { CategoryModel } from "./category/category.schema";
import { BrandModel } from "./brand/brand.schema";
import { faker } from "@faker-js/faker";
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
//         name: "Gaming",
//         slug: "gaming",
//         description: "Gaming consoles and accessories",
//       },
//       {
//         name: "Health & Beauty",
//         slug: "health-beauty",
//         description: "Health and beauty products",
//       },
//       {
//         name: "Automotive",
//         slug: "automotive",
//         description: "Automotive parts and accessories",
//       },
//       {
//         name: "Toys & Hobbies",
//         slug: "toys-hobbies",
//         description: "Toys, games, and hobby supplies",
//       },
//       {
//         name: "Groceries",
//         slug: "groceries",
//         description: "Daily essentials and groceries",
//       },
//     ];
//     await CategoryModel.insertMany(categories);
//     console.log("Categories seeded successfully!");

//     // Seed brands
//     const brands = [
//       {
//         name: "Sony",
//         logo_url: "https://example.com/sony-logo.png",
//         description: "Gaming and electronics brand",
//       },
//       {
//         name: "Maybelline",
//         logo_url: "https://example.com/maybelline-logo.png",
//         description: "Health and beauty brand",
//       },
//       {
//         name: "Goodyear",
//         logo_url: "https://example.com/goodyear-logo.png",
//         description: "Automotive tires and accessories",
//       },
//       {
//         name: "Lego",
//         logo_url: "https://example.com/lego-logo.png",
//         description: "Toys and hobby supplies",
//       },
//       {
//         name: "Whole Foods",
//         logo_url: "https://example.com/wholefoods-logo.png",
//         description: "Organic groceries and daily essentials",
//       },
//     ];
//     await BrandModel.insertMany(brands);
//     console.log("Brands seeded successfully!");

//     res.status(201).json({
//       message: "10 categories and 10 brands seeded successfully!",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const seedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch category and brand IDs
    const categories = await CategoryModel.find({}, "_id").lean();
    const brands = await BrandModel.find({}, "_id").lean();
    const categoryIds = categories.map((c) => c._id);
    const brandIds = brands.map((b) => b._id);

    if (categoryIds.length === 0 || brandIds.length === 0) {
      res.status(400).json({
        message: "Please seed categories and brands before seeding products.",
      });
      return;
    }

    // Generate 1000 unique products
    const slugs = new Set<string>();
    const fakeProducts = [];

    while (fakeProducts.length < 1000) {
      const name = faker.commerce.productName();
      let slug = faker.helpers.slugify(name).toLowerCase();

      // Ensure slug is unique
      let suffix = 1;
      let uniqueSlug = slug;
      while (slugs.has(uniqueSlug)) {
        uniqueSlug = `${slug}-${suffix++}`;
      }
      slugs.add(uniqueSlug);

      fakeProducts.push({
        name,
        slug: uniqueSlug,
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
        category_id: faker.helpers.arrayElement(categoryIds),
        brand_id: faker.helpers.arrayElement(brandIds),
        stock: faker.number.int({ min: 0, max: 100 }),
        images: [faker.image.url()],
        // Add other fields as needed
      });
    }

    await ProductModel.insertMany(fakeProducts);

    res.status(201).json({
      message: "1000 products seeded successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const seedProducts = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     // Fetch all products
//     const products = await ProductModel.find();

//     // Update each product with the subtotal
//     for (const product of products) {
//       const discountAmount =
//         product.discount_type === "percentage"
//           ? (product.price * product.discount_amount) / 100
//           : product.discount_amount;

//       const subtotal = product.price - discountAmount;

//       // Update the product with the subtotal
//       await ProductModel.findByIdAndUpdate(
//         product._id,
//         { subtotal },
//         { new: true }
//       );
//     }

//     res.status(200).json({
//       message: "All products have been updated with subtotals!",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
