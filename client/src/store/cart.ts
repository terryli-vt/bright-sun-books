import { reactive, watch } from "vue";

interface CartItem {
  id: number;
  title: string;
  author: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

const cart = reactive<CartItem[]>([]);

// Fetch cart from localStorage when the app starts
const loadCart = () => {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    const parsedCart: CartItem[] = JSON.parse(savedCart);
    parsedCart.forEach((item: CartItem) => {
      cart.push(item); // Populate cart state with saved items
    });
  }
};

// Save cart to localStorage whenever it changes
watch(
  cart,
  () => {
    localStorage.setItem("cart", JSON.stringify(cart));
  },
  { deep: true }
);

loadCart(); // Initialize the cart on app load

export default {
  cart,
  addToCart(book: CartItem) {
    // Check if the book already exists in the cart
    const existingItem = cart.find((item) => item.id === book.id);

    if (existingItem) {
      // If the item already exists, increase its quantity
      existingItem.quantity += 1;
    } else {
      // If the item doesn't exist, add it to the cart with quantity 1
      cart.push({ ...book, quantity: 1 });
    }
  },
  removeFromCart(bookId: number) {
    // Remove the item with the given bookId
    const index = cart.findIndex((item) => item.id === bookId);
    if (index !== -1) {
      cart.splice(index, 1); // Remove the item from the cart
    }
  },
  updateQuantity(bookId: number, action: "increase" | "decrease") {
    // Find the item in the cart and adjust the quantity
    const item = cart.find((item) => item.id === bookId);
    if (item) {
      if (action === "increase") {
        item.quantity += 1;
      } else if (action === "decrease" && item.quantity > 1) {
        item.quantity -= 1;
      }
    }
  },
  clearCart() {
    cart.length = 0; // Clear all items from the cart
  },
};
