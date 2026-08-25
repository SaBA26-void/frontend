/** Mirrors backend DTOs (ASP.NET camelCase JSON). */

export interface CategoryDto {
  id: number;
  name: string;
  children: CategoryDto[];
}

export interface ProductVariantDto {
  id: number;
  size: string | null;
  color: string | null;
  stockQuantity: number;
}

export interface ProductVariantInputDto {
  size?: string | null;
  color?: string | null;
  stockQuantity: number;
}

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  imageUrl: string;
  variants: ProductVariantDto[];
}

export interface PagedProductsDto {
  items: ProductDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrl: string;
  variants: ProductVariantInputDto[];
}

export interface UpdateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrl: string;
  variants: ProductVariantInputDto[];
}

export interface CreateCategoryDto {
  name: string;
  parentCategoryId?: number | null;
}

export interface UpdateCategoryDto {
  name: string;
  parentCategoryId?: number | null;
}

export interface GetProductsParams {
  categoryId?: number;
  page?: number;
  pageSize?: number;
}
