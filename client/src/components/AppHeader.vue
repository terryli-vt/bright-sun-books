<template>
  <header class="bg-blue-500 text-white py-2 shadow-md">
    <div class="container mx-auto flex justify-between items-center px-4">
      <!-- Home Link -->
      <section class="flex items-center space-x-1">
        <RouterLink to="/" class="flex items-center space-x-1">
          <img
            src="@/assets/site/logo.svg"
            alt="Bookstore Logo"
            class="w-20 h-auto"
          />
          <h1 class="text-2xl font-bold">Bright Sun Books</h1>
        </RouterLink>
      </section>

      <!-- Shopping Cart -->
      <section class="relative">
        <RouterLink
          to="/cart"
          class="flex items-center space-x-2 px-4 py-2 bg-white text-blue-500 rounded-lg shadow-lg hover:bg-gray-100 hover:shadow-sm transition-all relative"
        >
          <i class="fas fa-shopping-cart text-xl"></i>
        </RouterLink>
        <!-- Badge -->
        <div
          v-if="cartCount > 0"
          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold"
        >
          {{ cartCount }}
        </div>
      </section>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Declare a reactive variable for cart count
const cartCount = ref(9);
</script>

<style scoped></style>
