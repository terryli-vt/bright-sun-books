<template>
  <div>
    <!-- Category Navigation -->
    <CategoryNavigation />

    <!-- Book List -->
    <BookList :selectedCategoryId="categoryStore.selectedCategory.id" />
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { categoryStore } from "@/store/category";
import CategoryNavigation from "@/components/CategoryNavigation.vue";
import BookList from "@/components/BookList.vue";

const route = useRoute();
const router = useRouter();

// Function to sync store with the route
const syncCategoryWithRoute = () => {
  const categoryName = route.params.categoryName as string;

  if (categoryName) {
    const categoryExists = categoryStore.categories.some(
      (cat) => cat.name === categoryName
    );

    if (categoryExists) {
      categoryStore.setSelectedCategory(categoryName);
    } else {
      router.replace("/404"); // Redirect to 404 if invalid category
    }
  } else {
    categoryStore.resetToDefault(); // Reset to default if no category in URL
  }
};

// Sync on page load
onMounted(syncCategoryWithRoute);

// Watch route changes (for back/forward navigation)
watch(() => route.params.categoryName, syncCategoryWithRoute);
</script>
