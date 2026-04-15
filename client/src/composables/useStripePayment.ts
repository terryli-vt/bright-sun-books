import { ref } from "vue";
import {
  loadStripe,
  type Stripe,
  type StripeElements,
  type StripeCardElement,
} from "@stripe/stripe-js";
import type { OrderItem } from "@/types/order";
import { apiFetch } from "@/lib/api";

export interface BillingDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface CartLineInput {
  bookId: number;
  quantity: number;
}

export interface SubmitOrderResult {
  confirmationNumber: string;
  items: OrderItem[];
  subtotal: number;
  surcharge: number;
  total: number;
}

export function useStripePayment() {
  const stripe = ref<Stripe | null>(null);
  const elements = ref<StripeElements | null>(null);
  const cardElement = ref<StripeCardElement | null>(null);
  const cardComplete = ref(false);
  const cardError = ref("");
  const loading = ref(false);
  const overlayStep = ref(0);

  const initStripe = async (mountEl: HTMLElement) => {
    const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error("Stripe public key is not configured.");
    }
    stripe.value = await loadStripe(publicKey);
    if (!stripe.value) return;

    elements.value = stripe.value.elements();
    cardElement.value = elements.value.create("card", {
      style: {
        base: {
          fontSize: "15px",
          fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
          color: "#1d1d1f",
          "::placeholder": { color: "#9ca3af" },
        },
        invalid: { color: "#be123c" },
      },
    });
    cardElement.value.mount(mountEl);
    cardElement.value.on("change", (event) => {
      cardComplete.value = event.complete;
      cardError.value = event.error?.message ?? "";
    });
  };

  const teardown = () => {
    cardElement.value?.destroy();
    cardElement.value = null;
    elements.value = null;
    stripe.value = null;
  };

  const submitOrder = async (
    customer: BillingDetails,
    items: CartLineInput[],
  ): Promise<SubmitOrderResult> => {
    if (!stripe.value || !cardElement.value) {
      throw new Error("Payment form is not ready. Please refresh the page.");
    }
    if (!cardComplete.value) {
      throw new Error("Please enter your complete card details.");
    }

    loading.value = true;
    overlayStep.value = 0;

    try {
      const { clientSecret, paymentIntentId } = await apiFetch<{
        clientSecret: string;
        paymentIntentId: string;
      }>("/payments/create-intent", {
        method: "POST",
        body: JSON.stringify({ items }),
      });

      overlayStep.value = 1;
      const { error: stripeError, paymentIntent } =
        await stripe.value.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement.value,
            billing_details: {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: { line1: customer.address },
            },
          },
        });
      if (stripeError) {
        throw new Error(stripeError.message ?? "Payment failed.");
      }
      if (paymentIntent?.status !== "succeeded") {
        throw new Error(`Payment not completed (${paymentIntent?.status}).`);
      }

      overlayStep.value = 2;
      return await apiFetch<SubmitOrderResult>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customer,
          items,
          paymentIntentId,
          date: new Date().toISOString(),
        }),
      });
    } finally {
      loading.value = false;
    }
  };

  return {
    cardComplete,
    cardError,
    loading,
    overlayStep,
    initStripe,
    teardown,
    submitOrder,
  };
}
