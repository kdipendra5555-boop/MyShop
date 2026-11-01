export type ProductType = "wedding" | "visiting";

interface UserInterest {
  categories: Record<string, number>;
  products: Record<string, number>;
}

const STORAGE_KEY = "dotprint_user_interests";

const getInterests = (): UserInterest => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    return data
      ? JSON.parse(data)
      : { categories: {}, products: {} };
  } catch {
    return { categories: {}, products: {} };
  }
};

export const trackInterest = (
  type: ProductType,
  category: string,
  productId?: string,
  action: "view" | "cart" | "category" = "view"
) => {
  if (typeof window === "undefined") return;

  const interests = getInterests();

  const weight = {
    view: 2,
    cart: 5,
    category: 1,
  }[action];

  const categoryKey = `${type}:${category}`;

  interests.categories[categoryKey] =
    (interests.categories[categoryKey] || 0) + weight;

  if (productId) {
    const productKey = `${type}:${productId}`;

    interests.products[productKey] =
      (interests.products[productKey] || 0) + weight;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(interests));

  window.dispatchEvent(new Event("dotprint-interest-update"));
};

export const getUserInterests = () => getInterests();