<template>
  <div>
    <!-- Category Navigation -->
    <CategoryNavigation
      :categories="categories"
      :defaultCategory="defaultCategory"
      @categoryChange="handleCategoryChange"
    />

    <!-- Book List -->
    <BookList :selectedCategoryId="currentCategoryId" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CategoryNavigation from "@/components/CategoryNavigation.vue";
import BookList from "@/components/BookList.vue";

// Category data
const categories = [
  { id: 1, name: "Art", icon: "fas fa-paint-brush" },
  { id: 2, name: "Business", icon: "fas fa-briefcase" },
  { id: 3, name: "Health", icon: "fas fa-heartbeat" },
  { id: 4, name: "Science", icon: "fas fa-flask" },
  { id: 5, name: "Travel", icon: "fas fa-plane" },
];

// Default and current category
const defaultCategory = 1; // Default category is Art
const currentCategoryId = ref<number>(defaultCategory); // Current category state

// Handle category changes
const handleCategoryChange = (category: { id: number; name: string }) => {
  currentCategoryId.value = category.id;
};
</script>
