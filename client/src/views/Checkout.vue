<template>
  <div class="checkout-page">
    <CheckoutSteps :currentStep="2" />

    <div class="test-banner">
      <svg
        class="test-banner-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div>
        <strong>Test Mode — Do NOT enter real card details</strong>
        <p>
          Use one of these test cards with any future expiry and any 3-digit
          CVC:
        </p>
        <ul>
          <li><code>4242 4242 4242 4242</code> — Visa (success)</li>
          <li><code>5555 5555 5555 4444</code> — Mastercard (success)</li>
          <li><code>4000 0000 0000 9995</code> — Visa (insufficient funds)</li>
        </ul>
      </div>
    </div>

    <div class="checkout-layout">
      <BillingForm
        ref="billingFormRef"
        v-model="form"
        :phone-error="phoneError"
        :email-error="emailError"
        :card-error="cardError"
        @validate-phone="validatePhone"
        @validate-email="validateEmail"
      />

      <OrderSummary
        :items="cartItems"
        :subtotal="subtotal"
        :surcharge="surcharge"
        :total="total"
        :loading="loading"
        :disabled="isFormInvalid"
        @submit="submitOrder"
      />
    </div>

    <PaymentOverlay :show="loading" :step="overlayStep" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/composables/useToast";
import { useStripePayment } from "@/composables/useStripePayment";
import { computeTotals } from "@/lib/pricing";
import { isValidPhoneNumber } from "libphonenumber-js";
import CheckoutSteps from "@/components/CheckoutSteps.vue";
import BillingForm from "@/components/checkout/BillingForm.vue";
import OrderSummary from "@/components/checkout/OrderSummary.vue";
import PaymentOverlay from "@/components/checkout/PaymentOverlay.vue";

const router = useRouter();
const cartStore = useCartStore();
const toast = useToast();

const form = ref({
  name: "",
  address: "",
  phone: "",
  email: "",
});

const cartItems = cartStore.cart;

const totals = computed(() => computeTotals(cartItems));
const subtotal = computed(() => totals.value.subtotal);
const surcharge = computed(() => totals.value.surcharge);
const total = computed(() => totals.value.total);

const phoneError = ref(false);
const emailError = ref(false);

const validatePhone = () => {
  phoneError.value = !isValidPhoneNumber(form.value.phone, "US");
};
const validateEmail = () => {
  emailError.value = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email);
};

const {
  cardComplete,
  cardError,
  loading,
  overlayStep,
  initStripe,
  teardown,
  submitOrder: runPayment,
} = useStripePayment();

const billingFormRef = ref<InstanceType<typeof BillingForm> | null>(null);

onMounted(async () => {
  const mountEl = billingFormRef.value?.cardMountEl;
  if (!mountEl) return;
  try {
    await initStripe(mountEl);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Failed to load Stripe.");
  }
});

onBeforeUnmount(() => {
  teardown();
});

const submitOrder = async () => {
  validatePhone();
  validateEmail();

  if (phoneError.value || emailError.value) {
    toast.error("Please fix the highlighted fields before continuing.");
    return;
  }

  const items = cartItems.map((item) => ({
    bookId: item.id,
    quantity: item.quantity,
  }));
  const customer = {
    name: form.value.name,
    address: form.value.address,
    email: form.value.email,
    phone: form.value.phone,
  };

  try {
    const data = await runPayment(customer, items);
    cartStore.clearCart();
    sessionStorage.setItem(
      "orderDetails",
      JSON.stringify({
        confirmationNumber: data.confirmationNumber,
        date: new Date().toISOString(),
        customer,
        items: data.items,
        subtotal: data.subtotal,
        surcharge: data.surcharge,
        total: data.total,
      }),
    );
    router.push("/confirmation");
  } catch (error) {
    console.error("Error submitting order:", error);
    toast.error(
      error instanceof Error
        ? error.message
        : "There was an issue submitting your order. Please try again.",
    );
  }
};

const isFormInvalid = computed(
  () =>
    phoneError.value ||
    emailError.value ||
    !form.value.name ||
    !form.value.address ||
    !form.value.phone ||
    !form.value.email ||
    !cardComplete.value,
);
</script>

<style scoped>
.checkout-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding-bottom: var(--space-xl);
}

.test-banner {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
  margin: 0 var(--space-lg) var(--space-md);
  padding: 14px 16px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-card);
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
}

.test-banner-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #d97706;
}

.test-banner strong {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}

.test-banner p {
  margin: 0 0 6px;
}

.test-banner ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.test-banner code {
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 12px;
  background: rgba(217, 119, 6, 0.12);
  padding: 1px 5px;
  border-radius: 4px;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-lg);
  padding: 0 var(--space-lg);
  align-items: start;
}

@media (max-width: 860px) {
  .checkout-layout {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}

@media (max-width: 600px) {
  .checkout-layout,
  .test-banner {
    margin-inline: 0;
    padding-inline: var(--space-md);
  }
  .test-banner {
    margin: 0 var(--space-md) var(--space-sm);
  }
}
</style>
