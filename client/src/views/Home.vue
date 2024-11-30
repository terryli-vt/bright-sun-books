<template>
  <div class="relative w-full h-[91vh]">
    <!-- Background Image -->
    <!-- absolute inset-0 make a child element fill the entire parent -->
    <img
      src="@/assets/site/welcome1.jpg"
      alt="Welcome Image"
      class="absolute inset-0 w-full h-full object-cover brightness-50"
    />

    <!-- Overlay Text and Button -->
    <div
      class="absolute inset-0 flex flex-col items-center justify-center text-center text-white space-y-8"
    >
      <!-- Text Section -->
      <div class="space-y-4">
        <p class="text-4xl md:text-5xl font-semibold">Read and Purchase</p>
        <p class="text-5xl md:text-6xl font-bold">Quality Books</p>
        <p class="text-2xl md:text-3xl">Anywhere, Anytime</p>
      </div>

      <!-- Button -->
      <RouterLink to="/category">
        <button
          class="px-20 py-4 text-xl md:text-2xl bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          Shop for Books
        </button>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
