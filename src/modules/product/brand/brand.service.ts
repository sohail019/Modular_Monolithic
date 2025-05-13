import { BrandModel } from "./brand.schema";
import {
  CreateBrandDto,
  UpdateBrandDto,
  BrandQueryParams,
} from "./brand.types";

// Create a new brand
export const createBrand = async (brandData: CreateBrandDto) => {
  // Check if brand with same name exists
  const existingBrand = await BrandModel.findOne({ name: brandData.name });
  if (existingBrand) {
    throw new Error("Brand with this name already exists");
  }

  const brand = new BrandModel(brandData);
  return await brand.save();
};

// Get all brands with filtering/pagination
export const getAllBrands = async (query: BrandQueryParams = {}) => {
  const { page = 1, limit = 10, sort = "created_at", name } = query;

  const filter: any = {};

  // Apply filters if provided
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  const sortDirection = sort.startsWith("-") ? -1 : 1;
  const sortField = sort.startsWith("-") ? sort.substring(1) : sort;

  const brands = await BrandModel.find(filter)
    .sort({ [sortField]: sortDirection })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await BrandModel.countDocuments(filter);

  return {
    brands,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

// Get brand by ID
export const getBrandById = async (id: string) => {
  const brand = await BrandModel.findById(id);
  if (!brand) {
    throw new Error("Brand not found");
  }
  return brand;
};

// Update brand by ID
export const updateBrandById = async (
  id: string,
  updateData: UpdateBrandDto
) => {
  // If name is being updated, check if it's already in use
  if (updateData.name) {
    const existingBrand = await BrandModel.findOne({
      name: updateData.name,
      _id: { $ne: id },
    });

    if (existingBrand) {
      throw new Error("Brand with this name already exists");
    }
  }

  const brand = await BrandModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!brand) {
    throw new Error("Brand not found");
  }

  return brand;
};

// Delete brand by ID
export const deleteBrandById = async (id: string) => {
  const brand = await BrandModel.findByIdAndDelete(id);

  if (!brand) {
    throw new Error("Brand not found");
  }

  return { message: "Brand deleted successfully", id };
};

// Get products by brand ID (this could be implemented in the product service)
export const getProductsByBrandId = async (
  brandId: string,
  query: any = {}
) => {
  // This would typically query the Product model to find products by brandId
  // For now, returning a placeholder
  return { message: `Products for brand ${brandId} would be returned here` };
};
