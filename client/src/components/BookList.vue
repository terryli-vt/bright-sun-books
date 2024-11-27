<template>
  <div
    v-if="books.length > 0"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
  >
    <div
      v-for="book in books"
      :key="book.id"
      class="p-4 border rounded-lg shadow hover:shadow-lg transition-all"
    >
      <img
        :src="book.imageUrl"
        :alt="book.title"
        class="w-full h-64 object-cover mb-4 rounded-lg"
      />
      <h3 class="text-lg font-semibold">{{ book.title }}</h3>
      <p class="text-gray-500 italic mb-2">by {{ book.author }}</p>
      <p class="text-blue-600 font-bold text-lg mb-4">
        ${{ book.price.toFixed(2) }}
      </p>
      <button
        class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
      </button>
    </div>
  </div>
  <div v-else class="text-center text-gray-500 py-12">
    No books found in this category.
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, defineProps } from "vue";

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
</script>
