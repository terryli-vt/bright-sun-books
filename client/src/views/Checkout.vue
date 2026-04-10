<template>
  <div class="checkout-page">
    <!-- Step Indicator -->
    <CheckoutSteps :currentStep="2" />

    <!-- Test Mode Banner -->
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

    <!-- Two-panel layout -->
    <div class="checkout-layout">
      <!-- Left: Billing + Card Form -->
      <section class="form-panel">
        <h2 class="panel-title">Billing Information</h2>

        <form @submit.prevent="submitOrder" novalidate>
          <!-- Name -->
          <div class="field" :class="{ 'field-error-state': false }">
            <label for="name" class="field-label">Full Name</label>
            <input
              v-model="form.name"
              id="name"
              type="text"
              placeholder="Enter your full name"
              class="field-input"
              required
            />
          </div>

          <!-- Address -->
          <div class="field">
            <label for="address" class="field-label">Address</label>
            <input
              v-model="form.address"
              id="address"
              type="text"
              placeholder="Enter your address"
              class="field-input"
              required
            />
          </div>

          <!-- Phone -->
          <div class="field" :class="{ 'field-error-state': phoneError }">
            <label for="phone" class="field-label">Phone Number</label>
            <input
              v-model="form.phone"
              id="phone"
              type="tel"
              placeholder="e.g. +1 (555) 000-0000"
              class="field-input"
              @blur="validatePhone"
              required
            />
            <div v-if="phoneError" class="inline-error">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Please enter a valid phone number (e.g. +1 555 000 0000).
            </div>
          </div>

          <!-- Email -->
          <div class="field" :class="{ 'field-error-state': emailError }">
            <label for="email" class="field-label">Email</label>
            <input
              v-model="form.email"
              id="email"
              type="email"
              placeholder="you@example.com"
              class="field-input"
              @blur="validateEmail"
              required
            />
            <div v-if="emailError" class="inline-error">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Please enter a valid email address.
            </div>
          </div>

          <!-- Card Details -->
          <div class="field" :class="{ 'field-error-state': !!cardError }">
            <label class="field-label">Card Details</label>
            <div ref="cardElementRef" class="stripe-input"></div>
            <div v-if="cardError" class="inline-error">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ cardError }}
            </div>
          </div>
        </form>
      </section>

      <!-- Right: Order Summary + Submit -->
      <aside class="summary-panel">
        <h2 class="panel-title">Order Summary</h2>

        <ul class="summary-items">
          <li v-for="item in cartItems" :key="item.id" class="summary-item">
            <span class="summary-item-name"
              >{{ item.title }} <em>× {{ item.quantity }}</em></span
            >
            <span class="summary-item-price"
              >${{ (item.price * item.quantity).toFixed(2) }}</span
            >
          </li>
        </ul>

        <div class="summary-divider"></div>

        <div class="summary-row">
          <span>Subtotal</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>Surcharge (5%)</span>
          <span>${{ surcharge.toFixed(2) }}</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-total">
          <span>Total</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>

        <button
          type="button"
          class="submit-btn"
          :disabled="loading || isFormInvalid"
          @click="submitOrder"
        >
          <span v-if="loading" class="btn-spinner"></span>
          <svg v-else class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path
              fill-rule="evenodd"
              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
              clip-rule="evenodd"
            />
          </svg>
          {{ loading ? "Processing…" : "Place Order" }}
        </button>

        <p class="summary-note">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clip-rule="evenodd"
            />
          </svg>
          Secured by Stripe
        </p>
      </aside>
    </div>

    <!-- Payment processing overlay -->
    <Transition name="overlay-fade">
      <div
        v-if="loading"
        class="payment-overlay"
        aria-live="polite"
        aria-label="Processing payment"
      >
        <div class="overlay-card">
          <div class="overlay-spinner"></div>
          <p class="overlay-title">Processing your payment…</p>
          <p class="overlay-sub">Please don't close this window.</p>
          <div class="overlay-steps">
            <div
              class="overlay-step"
              :class="{ done: overlayStep > 0, active: overlayStep === 0 }"
            >
              <span class="os-dot"></span>Contacting Stripe
            </div>
            <div
              class="overlay-step"
              :class="{ done: overlayStep > 1, active: overlayStep === 1 }"
            >
              <span class="os-dot"></span>Confirming payment
            </div>
            <div
              class="overlay-step"
              :class="{ done: overlayStep > 2, active: overlayStep === 2 }"
            >
              <span class="os-dot"></span>Saving your order
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/composables/useToast";
import { isValidPhoneNumber } from "libphonenumber-js";
import {
  loadStripe,
  type Stripe,
  type StripeElements,
  type StripeCardElement,
} from "@stripe/stripe-js";
import CheckoutSteps from "@/components/CheckoutSteps.vue";

const router = useRouter();
const cartStore = useCartStore();
const toast = useToast();

// Form data
const form = ref({
  name: "",
  address: "",
  phone: "",
  email: "",
});

const cartItems = cartStore.cart;

const subtotal = computed(() =>
  cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
);
const surcharge = computed(() => subtotal.value * 0.05);
const total = computed(() => subtotal.value + surcharge.value);

// Validation errors
const phoneError = ref(false);
const emailError = ref(false);
const cardError = ref("");

const validatePhone = () => {
  phoneError.value = !isValidPhoneNumber(form.value.phone, "US");
};
const validateEmail = () => {
  emailError.value = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email);
};

// Stripe
const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const cardElement = ref<StripeCardElement | null>(null);
const cardElementRef = ref<HTMLDivElement | null>(null);
const cardComplete = ref(false);

onMounted(async () => {
  const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  if (!publicKey) {
    toast.error("Stripe public key is not configured.");
    return;
  }
  stripe.value = await loadStripe(publicKey);
  if (!stripe.value || !cardElementRef.value) return;

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
  cardElement.value.mount(cardElementRef.value);
  cardElement.value.on("change", (event) => {
    cardComplete.value = event.complete;
    cardError.value = event.error?.message ?? "";
  });
});

onBeforeUnmount(() => {
  cardElement.value?.destroy();
});

// Loading state + overlay progress
const loading = ref(false);
const overlayStep = ref(0);

const submitOrder = async () => {
  // Run field validations on submit
  validatePhone();
  validateEmail();

  if (phoneError.value || emailError.value) {
    toast.error("Please fix the highlighted fields before continuing.");
    return;
  }
  if (!stripe.value || !cardElement.value) {
    toast.error("Payment form is not ready. Please refresh the page.");
    return;
  }
  if (!cardComplete.value) {
    toast.error("Please enter your complete card details.");
    return;
  }

  loading.value = true;
  overlayStep.value = 0;

  try {
    const items = cartItems.map((item) => ({
      bookId: item.id,
      quantity: item.quantity,
    }));

    // Step 1: Create PaymentIntent
    overlayStep.value = 0;
    const intentRes = await fetch(
      `${import.meta.env.VITE_API_URL}/payments/create-intent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items }),
      },
    );
    if (!intentRes.ok) {
      const body = await intentRes.text();
      throw new Error(`create-intent failed (${intentRes.status}): ${body}`);
    }
    const { clientSecret, paymentIntentId } = await intentRes.json();

    // Step 2: Confirm card payment
    overlayStep.value = 1;
    const { error: stripeError, paymentIntent } =
      await stripe.value.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement.value,
          billing_details: {
            name: form.value.name,
            email: form.value.email,
            phone: form.value.phone,
            address: { line1: form.value.address },
          },
        },
      });
    if (stripeError) {
      throw new Error(stripeError.message ?? "Payment failed.");
    }
    if (paymentIntent?.status !== "succeeded") {
      throw new Error(`Payment not completed (${paymentIntent?.status}).`);
    }

    // Step 3: Save the order
    overlayStep.value = 2;
    const customer = {
      name: form.value.name,
      address: form.value.address,
      email: form.value.email,
      phone: form.value.phone,
    };
    const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        customer,
        items,
        paymentIntentId,
        date: new Date().toISOString(),
      }),
    });
    if (!orderRes.ok) {
      const body = await orderRes.text();
      throw new Error(`orders failed (${orderRes.status}): ${body}`);
    }
    const data = await orderRes.json();

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
  } finally {
    loading.value = false;
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
/* ── Page ─────────────────────────────────────────────────────── */
.checkout-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding-bottom: var(--space-xl);
}

/* ── Test Banner ─────────────────────────────────────────────── */
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

/* ── Two-panel Layout ────────────────────────────────────────── */
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-lg);
  padding: 0 var(--space-lg);
  align-items: start;
}

/* ── Panel common ────────────────────────────────────────────── */
.panel-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

/* ── Form Panel ──────────────────────────────────────────────── */
.form-panel {
  display: flex;
  flex-direction: column;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-sm);
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.field-input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-btn);
  font-family: var(--font-base);
  font-size: 15px;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
}

.field-input::placeholder {
  color: #9ca3af;
}

.field-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

.field-error-state .field-input,
.field-error-state .stripe-input {
  border-color: #be123c;
  box-shadow: 0 0 0 3px rgba(190, 18, 60, 0.12);
}

.stripe-input {
  padding: 13px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-btn);
  background: var(--color-bg-primary);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  cursor: text;
}

.inline-error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: #be123c;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 6px;
  padding: 6px 10px;
}

.inline-error svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* ── Summary Panel ───────────────────────────────────────────── */
.summary-panel {
  position: sticky;
  top: calc(60px + var(--space-md));
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-xs);
}

.summary-item-name {
  font-size: 13px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.summary-item-name em {
  font-style: normal;
  color: var(--color-text-secondary);
}

.summary-item-price {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.summary-divider {
  height: 1px;
  background: var(--color-border);
  margin: 2px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  margin-top: 4px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--color-text-primary);
  color: #fff;
  font-family: var(--font-base);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: var(--transition);
}

.submit-btn:hover:not(:disabled) {
  background: #333;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

.summary-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
}

.summary-note svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

/* ── Payment Overlay ─────────────────────────────────────────── */
.payment-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.overlay-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-card);
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.overlay-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.overlay-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.overlay-sub {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.overlay-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
}

.overlay-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.overlay-step.active {
  background: #eff6ff;
  color: #1e40af;
  font-weight: 500;
}

.overlay-step.done {
  color: #166534;
}

.os-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
  opacity: 0.5;
}

.overlay-step.active .os-dot {
  opacity: 1;
  animation: pulse 1s ease-in-out infinite;
}

.overlay-step.done .os-dot {
  opacity: 1;
}

/* Overlay fade transition */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.6;
  }
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 860px) {
  .checkout-layout {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  .summary-panel {
    position: static;
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
