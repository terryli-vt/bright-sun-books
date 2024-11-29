<template>
  <div
    v-if="books.length > 0"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-6"
  >
    <div
      v-for="book in books"
      :key="book.id"
      class="flex flex-col p-4 border rounded-lg shadow-lg hover:shadow-xl transition-all"
    >
      <!-- Book Cover -->
      <div
        class="flex justify-center mb-4"
        style="
          height: 232px;
          background-color: #f9f9f9;
          display: flex;
          align-items: center;
          border-radius: 8px;
        "
      >
        <img
          :src="book.imageUrl"
          :alt="book.title"
          class="h-full object-contain"
          style="max-width: 170px"
        />
      </div>

      <!-- Book Details -->
      <div class="flex-grow text-center space-y-2">
        <h3 class="text-lg font-semibold">{{ book.title }}</h3>
        <p class="text-gray-500 italic">by {{ book.author }}</p>
        <p class="text-blue-600 font-bold text-lg">
          ${{ book.price.toFixed(2) }}
        </p>
      </div>

      <!-- Add to Cart Button -->
      <button
        @click="addToCart(book)"
        class="mt-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
      >
        <i class="fas fa-cart-plus mr-2"></i>Add to Cart
      </button>
    </div>
  </div>
  <div v-else class="text-center text-gray-500 py-12">
    No books found in this category.
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, defineProps } from "vue";
import cartStore from "@/store/cart";

// Props to get the selected category
const props = defineProps({
  selectedCategoryId: {
    type: Number,
    required: true,
  },
});

// Reactive book data
interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
}

const books = ref<Book[]>([]);

// Fetch books based on category
const fetchBooks = async (categoryId: number) => {
  try {
    const response = await fetch(
      `http://localhost:8000/books/categories/${categoryId}`
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    books.value = await response.json();
  } catch (error) {
    console.error("Failed to fetch books:", error);
  }
};

// Watch for category changes
watchEffect(() => {
  fetchBooks(props.selectedCategoryId);
});

const addToCart = (book: {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
}) => {
  const cartItem = { ...book, quantity: 1 };
  cartStore.addToCart(cartItem); // Add book to cart via the cart store
};
</script>
