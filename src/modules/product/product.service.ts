import Product from "./product.schema";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
} from "./product.types";
import mongoose from "mongoose";
import { createSlug } from "../../utils/helpers";

// Create a new product
export const createProduct = async (productData: CreateProductDto) => {
  // Generate slug if not provided
  if (!productData.slug) {
    productData.slug = createSlug(productData.name);
  }

  const product = new Product({
    ...productData,
    category_id: new mongoose.Types.ObjectId(productData.category_id),
    brand_id: new mongoose.Types.ObjectId(productData.brand_id),
  });

  return await product.save();
};

// Get all products with filtering/pagination
// export const getAllProducts = async (query: ProductQueryParams) => {
//   const {
//     page = 1,
//     limit = 10,
//     sort = "created_at",
//     name,
//     min_price,
//     max_price,
//   } = query;

//   const filter: any = {};

//   // Apply filters if provided
//   if (name) {
//     filter.name = { $regex: name, $options: "i" };
//   }

//   if (min_price !== undefined || max_price !== undefined) {
//     filter.price = {};
//     if (min_price !== undefined) {
//       filter.price.$gte = min_price;
//     }
//     if (max_price !== undefined) {
//       filter.price.$lte = max_price;
//     }
//   }

//   const sortDirection = sort.startsWith("-") ? -1 : 1;
//   const sortField = sort.startsWith("-") ? sort.substring(1) : sort;

//   const products = await Product.find(filter)
//     .sort({ [sortField]: sortDirection })
//     .skip((page - 1) * limit)
//     .limit(limit);

//   const total = await Product.countDocuments(filter);

//   return {
//     products,
//     page,
//     limit,
//     total,
//     pages: Math.ceil(total / limit),
//   };
// };

export const getAllProducts = async (query: ProductQueryParams) => {
  const {
    page = 1,
    limit = 10,
    sort = "created_at",
    name,
    min_price,
    max_price,
  } = query;

  const filter: any = {};

  // Apply filters if provided
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  if (min_price !== undefined || max_price !== undefined) {
    filter.price = {};
    if (min_price !== undefined) {
      filter.price.$gte = min_price;
    }
    if (max_price !== undefined) {
      filter.price.$lte = max_price;
    }
  }

  const sortDirection = sort.startsWith("-") ? -1 : 1;
  const sortField = sort.startsWith("-") ? sort.substring(1) : sort;

  // Fetch products with category and brand populated
  const products = await Product.find(filter)
    .populate("category_id", "name slug description") // Populate category fields
    .populate("brand_id", "name logo_url description") // Populate brand fields
    .sort({ [sortField]: sortDirection })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean(); // Convert Mongoose documents to plain JavaScript objects

  // Transform the result to rename fields
  const transformedProducts = products.map((product) => {
    const { category_id, brand_id, ...rest } = product; // Destructure to exclude category_id and brand_id
    return {
      ...rest,
      category: category_id, // Rename category_id to category
      brand: brand_id, // Rename brand_id to brand
    };
  });

  const total = await Product.countDocuments(filter);

  return {
    products: transformedProducts,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

// Get product by ID
export const getProductById = async (id: string) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

// Get product by slug
export const getProductBySlug = async (slug: string) => {
  const product = await Product.findOne({ slug });
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

// Get products by category
export const getProductsByCategory = async (
  categoryId: string,
  query: ProductQueryParams
) => {
  const { page = 1, limit = 10, sort = "created_at" } = query;

  const sortDirection = sort.startsWith("-") ? -1 : 1;
  const sortField = sort.startsWith("-") ? sort.substring(1) : sort;

  const products = await Product.find({
    category_id: new mongoose.Types.ObjectId(categoryId),
  })
    .sort({ [sortField]: sortDirection })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Product.countDocuments({
    category_id: new mongoose.Types.ObjectId(categoryId),
  });

  return {
    products,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

// Get products by brand
export const getProductsByBrand = async (
  brandId: string,
  query: ProductQueryParams
) => {
  const { page = 1, limit = 10, sort = "created_at" } = query;

  const sortDirection = sort.startsWith("-") ? -1 : 1;
  const sortField = sort.startsWith("-") ? sort.substring(1) : sort;

  const products = await Product.find({
    brand_id: new mongoose.Types.ObjectId(brandId),
  })
    .sort({ [sortField]: sortDirection })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Product.countDocuments({
    brand_id: new mongoose.Types.ObjectId(brandId),
  });

  return {
    products,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

// Update product by ID
export const updateProductById = async (
  id: string,
  updateData: UpdateProductDto
) => {
  // If updating the name and no slug provided, generate a new slug
  if (updateData.name && !updateData.slug) {
    updateData.slug = createSlug(updateData.name);
  }

  // Convert IDs to ObjectId if they exist
  if (updateData.category_id) {
    updateData.category_id = new mongoose.Types.ObjectId(
      updateData.category_id
    ).toString();
  }

  if (updateData.brand_id) {
    updateData.brand_id = new mongoose.Types.ObjectId(
      updateData.brand_id
    ).toString();
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { ...updateData, updated_at: new Date() },
    { new: true }
  );

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

// Delete product by ID
export const deleteProductById = async (id: string) => {
  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new Error("Product not found");
  }

  return { message: "Product deleted successfully", id };
};

// Check product availability
export const checkProductAvailability = async (id: string) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  return {
    id: product.id,
    name: product.name,
    is_available: product.is_available && product.available_stock > 0,
    available_stock: product.available_stock,
  };
};

// Search products
export const searchProducts = async (
  searchTerm: string,
  query: ProductQueryParams
) => {
  const { page = 1, limit = 10, sort = "created_at" } = query;

  const sortDirection = sort.startsWith("-") ? -1 : 1;
  const sortField = sort.startsWith("-") ? sort.substring(1) : sort;

  const filter = {
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
    ],
  };

  const products = await Product.find(filter)
    .sort({ [sortField]: sortDirection })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  return {
    products,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};
export function decreaseStock(product_id: any, quantity: any) {
    throw new Error("Function not implemented.");
}

export function increaseStock(arg0: string, quantity: number) {
    throw new Error("Function not implemented.");
}

