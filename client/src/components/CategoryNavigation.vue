<template>
  <nav class="flex justify-center space-x-4 bg-blue-500 text-white py-4">
    <button
      v-for="category in categories"
      :key="category.id"
      class="flex items-center px-4 py-2 rounded-lg transition-all duration-300"
      :class="{
        'bg-white text-blue-500': activeCategory === category.id,
        'hover:bg-blue-600': activeCategory !== category.id,
      }"
      @click="changeCategory(category)"
    >
      <i :class="category.icon" class="mr-2"></i>
      {{ category.name }}
    </button>
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

// Change category and notify parent
const changeCategory = (category: { id: number; name: string }) => {
  activeCategory.value = category.id;
  emit("categoryChange", category);
};
</script>

<style scoped>
button {
  cursor: pointer;
}
</style>
