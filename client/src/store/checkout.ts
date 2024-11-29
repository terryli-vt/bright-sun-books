// track whether the user is authorized to access the Checkout Page
import { reactive } from "vue";

const checkoutState = reactive({
  canAccessCheckout: false,
});

export const useCheckoutStore = () => {
  const allowCheckout = () => {
    checkoutState.canAccessCheckout = true;
  };

  const resetCheckoutAccess = () => {
    checkoutState.canAccessCheckout = false;
  };

  const canAccessCheckout = () => {
    return checkoutState.canAccessCheckout;
  };

  return { allowCheckout, resetCheckoutAccess, canAccessCheckout };
};
