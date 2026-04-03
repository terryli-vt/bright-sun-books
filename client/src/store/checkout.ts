import { defineStore } from "pinia";
import { ref } from "vue";

export const useCheckoutStore = defineStore("checkout", () => {
  const canAccessCheckout = ref(false);

  function allowCheckout() {
    canAccessCheckout.value = true;
  }

  function resetCheckoutAccess() {
    canAccessCheckout.value = false;
  }

  return { canAccessCheckout, allowCheckout, resetCheckoutAccess };
});
