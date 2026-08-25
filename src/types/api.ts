/** Mirrors backend DTOs (ASP.NET camelCase JSON). */

export interface CategoryDto {
  id: number;
  name: string;
  children: CategoryDto[];
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
}

export interface UpdateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrl: string;
}

export interface GetProductsParams {
  categoryId?: number;
  page?: number;
  pageSize?: number;
}
