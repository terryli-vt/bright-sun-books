<template>
  <div class="max-w-4xl mx-auto p-4">
    <h2 class="text-3xl font-bold mb-6">Your Shopping Cart</h2>

    <!-- Continue Shopping Button -->
    <div class="mb-4">
      <RouterLink
        to="/category"
        class="btn btn-outline btn-success w-full sm:w-1/4"
      >
        Continue Shopping
      </RouterLink>
    </div>

    <!-- Total Items in Cart -->
    <div v-if="cart.length > 0" class="text-center text-lg text-gray-600 mb-6">
      You now have {{ totalItems }} items in your cart:
    </div>

    <!-- Empty Cart Message -->
    <div v-if="cart.length === 0" class="text-center text-xl text-gray-500">
      <p>Your cart is empty. Add some books to the cart!</p>
    </div>

    <!-- Cart Items -->
    <div v-else>
      <!-- Cart Table -->
      <div class="overflow-x-auto mb-6">
        <table class="min-w-full table-auto">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="px-4 py-2">Cover</th>
              <th class="px-4 py-2">Title</th>
              <th class="px-4 py-2">Author</th>
              <th class="px-4 py-2">Unit Price</th>
              <th class="px-4 py-2">Quantity</th>
              <th class="px-4 py-2">Subtotal</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in cart"
              :key="item.id"
              class="border-b odd:bg-gray-50 even:bg-gray-100"
            >
              <td class="px-4 py-2">
                <img
                  :src="item.imageUrl"
                  alt="Book Cover"
                  class="w-20 h-28 object-cover"
                />
              </td>
              <td class="px-4 py-2">{{ item.title }}</td>
              <td class="px-4 py-2 italic">{{ item.author }}</td>
              <td class="px-4 py-2">${{ item.price.toFixed(2) }}</td>
              <td class="px-4 py-2 h-full flex items-center space-x-2">
                <button
                  @click="updateQuantity(item.id, 'decrease')"
                  class="btn btn-sm btn-outline btn-accent"
                >
                  -
                </button>
                <span>{{ item.quantity }}</span>
                <button
                  @click="updateQuantity(item.id, 'increase')"
                  class="btn btn-sm btn-square btn-accent"
                >
                  +
                </button>
              </td>
              <td class="px-4 py-2">
                ${{ (item.price * item.quantity).toFixed(2) }}
              </td>
              <td class="px-4 py-2">
                <button
                  @click="removeFromCart(item.id)"
                  class="btn btn-link text-slate-500"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cart Summary -->
      <div class="mt-4 flex justify-start items-center">
        <button @click="clearCart" class="btn btn-link text-slate-500">
          Clear Cart
        </button>
      </div>

      <!-- Cart Total Price -->
      <div class="mt-4 flex justify-center items-center text-lg font-semibold">
        <p>Your Cart Total: ${{ total.toFixed(2) }}</p>
      </div>
    </div>

    <!-- Proceed to Checkout -->
    <div class="my-4 text-center">
      <button
        v-if="cart.length > 0"
        class="btn btn-lg btn-primary w-full sm:w-auto"
      >
        Proceed to Checkout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import cartStore from "@/store/cart";
import { RouterLink } from "vue-router";

// Get cart from the store
const cart = cartStore.cart;

// Computed properties
const total = computed(() => {
  return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
});

// Total number of items (considering quantity)
const totalItems = computed(() => {
  return cart.reduce((acc, item) => acc + item.quantity, 0);
});

// Remove item from cart
const removeFromCart = (bookId: number) => {
  cartStore.removeFromCart(bookId);
};

// Update item quantity
const updateQuantity = (bookId: number, action: "increase" | "decrease") => {
  if (
    action === "decrease" &&
    cart.find((item) => item.id === bookId)?.quantity === 1
  ) {
    removeFromCart(bookId);
  } else {
    cartStore.updateQuantity(bookId, action);
  }
};

// Clear the cart
const clearCart = () => {
  cartStore.clearCart();
};
</script>

<style scoped>
/* Optional: Ensure the cart table is fully responsive */
@media (max-width: 768px) {
  .overflow-x-auto {
    overflow-x: scroll;
  }

  .btn {
    width: 100%;
  }
}
</style>
