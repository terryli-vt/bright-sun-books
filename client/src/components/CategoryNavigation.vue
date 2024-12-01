<template>
  <nav class="bg-slate-100">
    <!-- Hamburger Icon for Small Screens -->
    <div class="flex justify-between items-center px-4 py-2 md:hidden">
      <h1 class="text-lg font-bold">Categories</h1>
      <button @click="toggleMenu" class="focus:outline-none">
        <i
          :class="menuOpen ? 'fas fa-times text-xl' : 'fas fa-bars text-xl'"
        ></i>
      </button>
    </div>

    <!-- Category Buttons -->
    <div
      :class="[
        'md:flex md:flex-row md:space-x-4 space-y-2 md:space-y-0 justify-center py-5 px-5',
        menuOpen ? 'flex flex-col' : 'hidden',
      ]"
    >
      <button
        v-for="category in categoryStore.categories"
        :key="category.id"
        class="btn btn-outline btn-primary"
        :class="{
          'btn-active': categoryStore.selectedCategory.id === category.id,
        }"
        @click="changeCategory(category)"
      >
        <i :class="category.icon" class="mr-2"></i>
        {{ category.name }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { categoryStore } from "@/store/category";

const router = useRouter();
const menuOpen = ref<boolean>(false);

// Toggle Hamburger Menu
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

// Change category and update URL
const changeCategory = (category: { id: number; name: string }) => {
  categoryStore.setSelectedCategory(category.name);
  menuOpen.value = false; // Close menu on category selection
  router.push({ name: "Category", params: { categoryName: category.name } });
};
</script>
