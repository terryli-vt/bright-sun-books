<template>
  <div class="max-w-4xl mx-auto p-4">
    <h2 class="text-3xl font-bold mb-6">Checkout</h2>

    <!-- Test Mode Banner -->
    <div role="alert" class="alert alert-warning mb-6 items-start">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <div>
        <h3 class="font-bold">Test Mode — Do NOT enter real card details</h3>
        <div class="text-sm mt-1">
          This site is running in Stripe test mode. Use one of these test cards
          with any future expiry date and any 3-digit CVC:
        </div>
        <ul class="text-sm mt-2 font-mono space-y-1">
          <li><strong>4242 4242 4242 4242</strong> — Visa (success)</li>
          <li><strong>5555 5555 5555 4444</strong> — Mastercard (success)</li>
          <li>
            <strong>4000 0000 0000 9995</strong> — Visa (insufficient funds)
          </li>
        </ul>
      </div>
    </div>

    <!-- User Details Form -->
    <div class="card bg-slate-50 shadow-md mb-6">
      <div class="card-body">
        <h3 class="text-xl font-semibold mb-4">Billing Information</h3>

        <form @submit.prevent="submitOrder">
          <!-- Name -->
          <div class="mb-4">
            <label for="name" class="label">
              <span class="label-text">Full Name</span>
            </label>
            <input
              v-model="form.name"
              id="name"
              type="text"
              placeholder="Enter your full name"
              class="input input-bordered w-full"
              required
            />
          </div>

          <!-- Address -->
          <div class="mb-4">
            <label for="address" class="label">
              <span class="label-text">Address</span>
            </label>
            <input
              v-model="form.address"
              id="address"
              type="text"
              placeholder="Enter your address"
              class="input input-bordered w-full"
              required
            />
          </div>

          <!-- Phone -->
          <div class="mb-4">
            <label for="phone" class="label">
              <span class="label-text">Phone Number</span>
            </label>
            <input
              v-model="form.phone"
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              class="input input-bordered w-full"
              @blur="validatePhone"
              required
            />
            <div v-if="phoneError" class="text-red-500 text-sm mt-1">
              Invalid phone number.
            </div>
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              v-model="form.email"
              id="email"
              type="email"
              placeholder="Enter your email"
              class="input input-bordered w-full"
              @blur="validateEmail"
              required
            />
            <div v-if="emailError" class="text-red-500 text-sm mt-1">
              Invalid email address.
            </div>
          </div>

          <!-- Stripe Card Element -->
          <div class="mb-4">
            <label class="label">
              <span class="label-text">Card Details</span>
            </label>
            <div
              ref="cardElementRef"
              class="input input-bordered w-full py-3 h-auto"
            ></div>
            <div v-if="cardError" class="text-red-500 text-sm mt-1">
              {{ cardError }}
            </div>
          </div>

          <!-- Order Summary -->
          <div class="mt-6">
            <h3 class="text-xl font-semibold mb-4">Order Summary</h3>
            <div class="flex justify-between mb-4">
              <span>Subtotal:</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between mb-4">
              <span>Surcharge (5%):</span>
              <span>${{ surcharge.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between mb-4 font-bold">
              <span>Total:</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="mt-6">
            <button
              type="submit"
              class="btn btn-primary w-full"
              :disabled="loading || isFormInvalid"
            >
              <span
                v-if="loading"
                class="loading loading-spinner loading-md spinner"
              ></span>
              <span v-else>Submit Order</span>
            </button>
            <div v-if="submitError" class="text-red-500 text-sm mt-2">
              {{ submitError }}
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/store/cart";
import { isValidPhoneNumber } from "libphonenumber-js";
import {
  loadStripe,
  type Stripe,
  type StripeElements,
  type StripeCardElement,
} from "@stripe/stripe-js";

const router = useRouter();
const cartStore = useCartStore();

// Form data
const form = ref({
  name: "",
  address: "",
  phone: "",
  email: "",
});

// Fetch cart items from the store
const cartItems = cartStore.cart;

// Computed properties for subtotal, surcharge, and total
const subtotal = computed(() => {
  return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
});

const surcharge = computed(() => {
  return subtotal.value * 0.05; // 5% surcharge
});

const total = computed(() => {
  return subtotal.value + surcharge.value;
});

// Form validation errors
const phoneError = ref(false);
const emailError = ref(false);
const cardError = ref("");
const submitError = ref("");

// Validate phone number
const validatePhone = () => {
  phoneError.value = !isValidPhoneNumber(form.value.phone, "US");
};

// Validate email
const validateEmail = () => {
  emailError.value = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email);
};

// --- Stripe Elements ---
const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const cardElement = ref<StripeCardElement | null>(null);
const cardElementRef = ref<HTMLDivElement | null>(null);
const cardComplete = ref(false);

onMounted(async () => {
  const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  if (!publicKey) {
    submitError.value = "Stripe public key is not configured.";
    return;
  }

  stripe.value = await loadStripe(publicKey);
  if (!stripe.value || !cardElementRef.value) return;

  elements.value = stripe.value.elements();
  cardElement.value = elements.value.create("card", {
    style: {
      base: {
        fontSize: "16px",
        color: "#1f2937",
        "::placeholder": { color: "#9ca3af" },
      },
      invalid: { color: "#ef4444" },
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

// Order submission
const loading = ref(false);

// Submit the order
const submitOrder = async () => {
  submitError.value = "";

  if (phoneError.value || emailError.value) {
    submitError.value = "Please correct the errors before submitting.";
    return;
  }
  if (!stripe.value || !cardElement.value) {
    submitError.value = "Payment form is not ready. Please refresh.";
    return;
  }
  if (!cardComplete.value) {
    submitError.value = "Please enter your card details.";
    return;
  }

  loading.value = true;
  try {
    const items = cartItems.map((item) => ({
      bookId: item.id,
      quantity: item.quantity,
    }));

    // 1. Create a PaymentIntent on the server (server recomputes the total)
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

    // 2. Confirm the card payment with Stripe directly from the client
    //  Browser ── card+secret ────► Stripe
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
      submitError.value = stripeError.message ?? "Payment failed.";
      return;
    }
    if (paymentIntent?.status !== "succeeded") {
      submitError.value = `Payment not completed (${paymentIntent?.status}).`;
      return;
    }

    // 3. Save the order — backend re-verifies the PaymentIntent
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

    // Clear cart
    cartStore.clearCart();

    // Store order details (with server-generated confirmation number and prices)
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

    // Navigate to confirmation page
    router.push("/confirmation");
  } catch (error) {
    console.error("Error submitting order:", error);
    submitError.value =
      error instanceof Error
        ? error.message
        : "There was an issue submitting your order. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Check if the form is invalid
const isFormInvalid = computed(() => {
  return (
    phoneError.value ||
    emailError.value ||
    !form.value.name ||
    !form.value.address ||
    !form.value.phone ||
    !form.value.email ||
    !cardComplete.value
  );
});
</script>

<style scoped></style>
