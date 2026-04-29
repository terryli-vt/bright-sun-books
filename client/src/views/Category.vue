<template>
  <div>
    <!-- Category Navigation -->
    <CategoryNavigation />

    <!-- Book List -->
    <BookList :selectedCategoryId="categoryStore.selectedCategory.id" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCategoryStore } from "@/store/category";

const categoryStore = useCategoryStore();
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

// Sync on page load and scroll to top (component is recreated on each navigation due to :key="$route.path")
onMounted(() => {
  syncCategoryWithRoute();
  window.scrollTo(0, 0);
});
</script>
