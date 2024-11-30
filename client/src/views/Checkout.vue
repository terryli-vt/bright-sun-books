<template>
  <div class="max-w-4xl mx-auto p-4">
    <h2 class="text-3xl font-bold mb-6">Checkout</h2>

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

          <!-- Credit Card Number -->
          <div class="mb-4">
            <label for="creditCard" class="label">
              <span class="label-text">Credit Card Number</span>
            </label>
            <div class="flex items-center space-x-2">
              <input
                v-model="form.creditCard"
                id="creditCard"
                type="text"
                placeholder="Enter credit card number"
                class="input input-bordered w-full"
                @blur="validateCardNumber"
                @input="updateCardNumber"
                required
              />
              <img
                v-if="cardType"
                :src="cardType.icon"
                alt="Card Type"
                class="w-10 h-10"
              />
            </div>
            <div v-if="cardError" class="text-red-500 text-sm mt-1">
              Invalid card number.
            </div>
          </div>

          <!-- Expiration Date -->
          <div class="mb-4 flex space-x-4">
            <div class="flex-1">
              <label for="expMonth" class="label">
                <span class="label-text">Expiration Month</span>
              </label>
              <select
                v-model="form.expMonth"
                id="expMonth"
                class="select select-bordered w-full"
                required
              >
                <option disabled value="">Select Month</option>
                <option v-for="month in months" :key="month" :value="month">
                  {{ month }}
                </option>
              </select>
            </div>
            <div class="flex-1">
              <label for="expYear" class="label">
                <span class="label-text">Expiration Year</span>
              </label>
              <select
                v-model="form.expYear"
                id="expYear"
                class="select select-bordered w-full"
                required
              >
                <option disabled value="">Select Year</option>
                <option v-for="year in years" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
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
              <span v-if="loading" class="spinner"></span>
              <span v-else>Submit Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import cartStore from "@/store/cart"; // import the cart store
import { isValidPhoneNumber } from "libphonenumber-js";
import * as valid from "card-validator";

// Form data
const form = ref({
  name: "",
  address: "",
  phone: "",
  email: "",
  creditCard: "",
  expMonth: "",
  expYear: "",
});

// Generate months (01 to 12)
const months = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);

// Generate years (current year to current year + 10)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

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
const cardError = ref(false);

// Card type icon
const cardType = ref<{ icon: string } | null>(null);

// Validate phone number
const validatePhone = () => {
  phoneError.value = !isValidPhoneNumber(form.value.phone, "US");
};

// Validate email
const validateEmail = () => {
  // Use the HTMLInputElement's native checkValidity() method to validate email addresses.
  // This leverages the browser's built-in email validation.
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.value = form.value.email;

  emailError.value = !emailInput.checkValidity();
};

// Validate credit card number and get card type
const validateCardNumber = () => {
  const rawCardNumber = form.value.creditCard
    .split("") // Split into characters
    .filter((char) => char !== " ") // Keep only non-space characters
    .join(""); // Join back into a string

  const cardValidation = valid.number(rawCardNumber);
  cardError.value = !cardValidation.isValid;

  // Update form.creditCard to the raw number for submission
  form.value.creditCard = rawCardNumber;
};

const updateCardNumber = (event: Event) => {
  // format
  const input = event.target as HTMLInputElement;
  const rawValue = input.value.split(" ").join(""); // Remove spaces

  const formattedValue = [];
  for (let i = 0; i < rawValue.length; i += 4) {
    formattedValue.push(rawValue.slice(i, i + 4));
  }

  // Join the groups with spaces
  input.value = formattedValue.join(" ");
  form.value.creditCard = input.value; // Update model value

  // Get card type icon
  const cardValidation = valid.number(form.value.creditCard);

  if (cardValidation.isPotentiallyValid) {
    const type = cardValidation.card?.type;

    if (type) {
      cardType.value = {
        icon: new URL(`../assets/card/${type}.svg`, import.meta.url).href,
      };
    } else {
      cardType.value = {
        icon: new URL(`../assets/card/generic.svg`, import.meta.url).href,
      };
    }
  } else {
    cardType.value = null;
  }
};

// Order submission
const loading = ref(false);

const generateConfirmationNumber = async (): Promise<string> => {
  let isUnique = false;
  let confirmationNumber = "";

  while (!isUnique) {
    confirmationNumber = Math.floor(
      100000000 + Math.random() * 900000000
    ).toString(); // Generate 9-digit number

    // Check uniqueness via backend API
    const response = await fetch(
      "http://localhost:8000/orders/check-confirmation-number",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationNumber }),
      }
    );

    const data = await response.json();
    isUnique = data.isUnique;
  }

  return confirmationNumber;
};

// Submit the order
const submitOrder = async () => {
  if (phoneError.value || emailError.value || cardError.value) {
    alert("Please correct the errors before submitting.");
    return;
  }

  // Disable button and show loading spinner
  loading.value = true;
  const confirmationNumber = await generateConfirmationNumber();
  // Create the order payload
  const orderPayload = {
    customer: {
      name: form.value.name,
      address: form.value.address,
      email: form.value.email,
      phone: form.value.phone,
      creditCard: form.value.creditCard,
      expMonth: form.value.expMonth,
      expYear: form.value.expYear,
    },
    items: cartItems.map((item) => ({
      bookId: item.id,
      quantity: item.quantity,
    })),
    confirmationNumber,
    date: new Date(),
    subtotal: subtotal.value,
    surcharge: surcharge.value,
    total: total.value,
  };

  try {
    // Call the add-order API
    const response = await fetch("http://localhost:8000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      throw new Error("Failed to submit order");
    }

    const data = await response.json();

    // Store order details in sessionStorage for the confirmation page
    sessionStorage.setItem("orderDetails", JSON.stringify(data));

    // Navigate to confirmation page
    window.location.href = "/confirmation";
  } catch (error) {
    console.error("Error submitting order:", error);
    alert("There was an issue submitting your order. Please try again.");
  } finally {
    loading.value = false;
  }
};

// Check if the form is invalid
const isFormInvalid = computed(() => {
  return (
    phoneError.value ||
    emailError.value ||
    cardError.value ||
    !form.value.name ||
    !form.value.address ||
    !form.value.phone ||
    !form.value.email ||
    !form.value.creditCard ||
    !form.value.expMonth ||
    !form.value.expYear
  );
});
</script>

<style scoped></style>
