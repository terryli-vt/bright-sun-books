<template>
  <nav class="bg-blue-400 text-white">
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
        'md:flex md:flex-row md:space-x-4 space-y-2 md:space-y-0 justify-center py-4',
        menuOpen ? 'flex flex-col' : 'hidden',
      ]"
    >
      <button
        v-for="category in categories"
        :key="category.id"
        class="flex items-center px-4 py-2 mx-2 md:mx-0 rounded-lg transition-all duration-300"
        :class="{
          'bg-white text-blue-600': activeCategory === category.id,
          'hover:bg-blue-700': activeCategory !== category.id,
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
import { ref, defineProps, defineEmits } from "vue";

// Props
const props = defineProps({
  categories: {
    type: Array as () => { id: number; name: string; icon: string }[],
    required: true,
  },
  defaultCategory: {
    type: Number,
    required: true,
  },
});

// Emit events to parent
const emit = defineEmits(["categoryChange"]);

// Reactive state
const activeCategory = ref<number>(props.defaultCategory);
const menuOpen = ref<boolean>(false);

// Toggle Hamburger Menu
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

// Change category and notify parent
const changeCategory = (category: { id: number; name: string }) => {
  activeCategory.value = category.id;
  emit("categoryChange", category);
  menuOpen.value = false; // Close menu on category selection
};
</script>

<style scoped>
button {
  cursor: pointer;
  min-width: 120px;
  text-align: center;
}
</style>
