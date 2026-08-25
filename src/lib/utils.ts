import type { CategoryDto } from "@/types/api";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function findCategoryById(
  categories: CategoryDto[],
  id: number,
): CategoryDto | undefined {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }

    const nested = findCategoryById(category.children, id);
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

export function flattenCategories(categories: CategoryDto[]): CategoryDto[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children),
  ]);
}
