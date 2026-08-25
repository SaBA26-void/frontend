import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAdminPassword } from "@/lib/adminAuth";
import type {
  CategoryDto,
  CreateCategoryDto,
  CreateOrderDto,
  CreateProductDto,
  GetProductsParams,
  OrderDto,
  PagedProductsDto,
  ProductDto,
  UpdateCategoryDto,
  UpdateProductDto,
} from "@/types/api";

export const onlineShopApi = createApi({
  reducerPath: "onlineShopApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      const password = getAdminPassword();
      if (password) {
        headers.set("X-Admin-Password", password);
      }
      return headers;
    },
  }),
  tagTypes: ["Categories", "Products", "Product", "Orders"],
  endpoints: (builder) => ({
    loginAdmin: builder.mutation<{ message: string }, { password: string }>({
      query: (body) => ({
        url: "/api/admin/login",
        method: "POST",
        body,
      }),
    }),
    getOrders: builder.query<OrderDto[], void>({
      query: () => "/api/orders",
      providesTags: ["Orders"],
    }),
    createOrder: builder.mutation<OrderDto, CreateOrderDto>({
      query: (body) => ({
        url: "/api/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),
    getCategories: builder.query<CategoryDto[], void>({
      query: () => "/api/categories",
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation<CategoryDto, CreateCategoryDto>({
      query: (body) => ({
        url: "/api/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation<
      CategoryDto,
      { id: number; body: UpdateCategoryDto }
    >({
      query: ({ id, body }) => ({
        url: `/api/categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
    getProducts: builder.query<PagedProductsDto, GetProductsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 10;

        searchParams.set("page", String(page));
        searchParams.set("pageSize", String(pageSize));

        if (params?.categoryId != null) {
          searchParams.set("categoryId", String(params.categoryId));
        }

        return `/api/products?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),
    getProductById: builder.query<ProductDto, number>({
      query: (id) => `/api/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation<ProductDto, CreateProductDto>({
      query: (body) => ({
        url: "/api/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    updateProduct: builder.mutation<ProductDto, { id: number; body: UpdateProductDto }>({
      query: ({ id, body }) => ({
        url: `/api/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Products", id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Product", id },
        { type: "Products", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useLoginAdminMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = onlineShopApi;
