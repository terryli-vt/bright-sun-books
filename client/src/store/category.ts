import { reactive } from "vue";

export const categoryStore = reactive({
  categories: [
    { id: 1, name: "Art", icon: "fas fa-paint-brush" },
    { id: 2, name: "Business", icon: "fas fa-briefcase" },
    { id: 3, name: "Health", icon: "fas fa-heartbeat" },
    { id: 4, name: "Science", icon: "fas fa-flask" },
    { id: 5, name: "Travel", icon: "fas fa-plane" },
  ],
  selectedCategory: { id: 1, name: "Art", icon: "fas fa-paint-brush" },

  setSelectedCategory(categoryName: string) {
    const category = this.categories.find((cat) => cat.name === categoryName);
    if (category) {
      this.selectedCategory = category;
    }
  },

  resetToDefault() {
    this.selectedCategory = this.categories[0]; // Default to first category
  },
});
