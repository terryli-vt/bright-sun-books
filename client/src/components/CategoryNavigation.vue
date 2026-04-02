<template>
  <nav class="cat-nav">
    <div class="cat-nav-inner">
      <button
        v-for="category in categoryStore.categories"
        :key="category.id"
        class="cat-btn"
        :class="{ 'cat-btn--active': categoryStore.selectedCategory.id === category.id }"
        @click="changeCategory(category)"
      >
        <i :class="category.icon" class="cat-btn-icon"></i>
        <span>{{ category.name }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { categoryStore } from "@/store/category";

const router = useRouter();

const changeCategory = (category: { id: number; name: string }) => {
  categoryStore.setSelectedCategory(category.name);
  router.push({ name: "Category", params: { categoryName: category.name } });
};
</script>

<style scoped>
.cat-nav {
  position: sticky;
  top: 60px;
  z-index: 90;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
}

.cat-nav-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  height: 52px;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  overflow-x: auto;
  scrollbar-width: none;
}

.cat-nav-inner::-webkit-scrollbar {
  display: none;
}

.cat-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-base);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.cat-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.cat-btn--active {
  background: var(--color-text-primary);
  color: #ffffff;
}

.cat-btn--active:hover {
  background: #333333;
  color: #ffffff;
}

.cat-btn-icon {
  font-size: 13px;
}

@media (max-width: 900px) {
  .cat-nav-inner {
    padding: 0 var(--space-md);
  }
}
</style>
