import { defineStore } from "pinia";
import { reactive, watch } from "vue";

interface CartItem {
  id: number;
  title: string;
  author: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export const useCartStore = defineStore("cart", () => {
  const cart = reactive<CartItem[]>([]);

  const saved = localStorage.getItem("cart");
  if (saved) {
    (JSON.parse(saved) as CartItem[]).forEach((item) => cart.push(item));
  }

  watch(
    cart,
    () => {
      localStorage.setItem("cart", JSON.stringify(cart));
    },
    { deep: true }
  );

  function addToCart(book: CartItem) {
    const existing = cart.find((item) => item.id === book.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...book, quantity: 1 });
    }
  }

  function removeFromCart(bookId: number) {
    const index = cart.findIndex((item) => item.id === bookId);
    if (index !== -1) cart.splice(index, 1);
  }

  function updateQuantity(bookId: number, action: "increase" | "decrease") {
    const item = cart.find((item) => item.id === bookId);
    if (item) {
      if (action === "increase") item.quantity += 1;
      else if (action === "decrease" && item.quantity > 1) item.quantity -= 1;
    }
  }

  function clearCart() {
    cart.length = 0;
  }

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart };
});
