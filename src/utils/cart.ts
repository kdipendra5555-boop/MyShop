
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

const CART_KEY = "dotprint_cart";

export const getCart = (): CartItem[] => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  window.dispatchEvent(new Event("cartUpdated"));
};

export const addToCart = (
  product: Omit<CartItem, "quantity">,
  quantity = 1
) => {
  const cart = getCart();

  const existing = cart.find(
    (item) => item.id === product.id
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      ...product,
      quantity,
    });
  }

  saveCart(cart);
};

export const updateCartQuantity = (
  id: string,
  quantity: number
) => {
  const cart = getCart();

  const updated = cart
    .map((item) =>
      item.id === id
        ? { ...item, quantity }
        : item
    )
    .filter((item) => item.quantity > 0);

  saveCart(updated);
};

export const removeFromCart = (id: string) => {
  const cart = getCart().filter(
    (item) => item.id !== id
  );

  saveCart(cart);
};

export const clearCart = () => {
  saveCart([]);
};

export const getCartCount = () => {
  return getCart().reduce(
    (total, item) => total + item.quantity,
    0
  );
};

