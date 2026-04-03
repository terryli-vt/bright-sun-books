import { defineStore } from "pinia";
import { ref } from "vue";

export const useCategoryStore = defineStore("category", () => {
  const categories = [
    { id: 1, name: "Art", icon: "fas fa-paint-brush" },
    { id: 2, name: "Business", icon: "fas fa-briefcase" },
    { id: 3, name: "Health", icon: "fas fa-heartbeat" },
    { id: 4, name: "Science", icon: "fas fa-flask" },
    { id: 5, name: "Travel", icon: "fas fa-plane" },
  ];

  const selectedCategory = ref(categories[0]);

  function setSelectedCategory(categoryName: string) {
    const category = categories.find((cat) => cat.name === categoryName);
    if (category) selectedCategory.value = category;
  }

  function resetToDefault() {
    selectedCategory.value = categories[0];
  }

  return { categories, selectedCategory, setSelectedCategory, resetToDefault };
});
