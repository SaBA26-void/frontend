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

export interface FlatCategoryOption {
  id: number;
  label: string;
  depth: number;
}

export function flattenCategoryOptions(
  categories: CategoryDto[],
  depth = 0,
): FlatCategoryOption[] {
  return categories.flatMap((category) => [
    {
      id: category.id,
      label: `${"— ".repeat(depth)}${category.name}`,
      depth,
    },
    ...flattenCategoryOptions(category.children, depth + 1),
  ]);
}
