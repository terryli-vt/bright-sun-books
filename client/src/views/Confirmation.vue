<template>
  <div class="max-w-4xl mx-auto p-4" v-if="orderDetails">
    <div class="text-center">
      <div
        class="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto"
      >
        <svg
          class="w-8 h-8 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m-7 8a9 9 0 100-18 9 9 0 000 18z"
          />
        </svg>
      </div>
      <h2 class="text-3xl font-bold mt-4">Thank you for shopping with us!</h2>
    </div>

    <div class="mt-6">
      <h3 class="text-xl font-semibold mb-4">Order Details</h3>
      <div>
        <p>
          <strong>Confirmation Number:</strong>
          {{ orderDetails.confirmationNumber }}
        </p>
        <p><strong>Timestamp:</strong> {{ orderDetails.timestamp }}</p>
        <p><strong>Customer Name:</strong> {{ orderDetails.customer.name }}</p>
        <p><strong>Address:</strong> {{ orderDetails.customer.address }}</p>
        <p><strong>Email:</strong> {{ orderDetails.customer.email }}</p>
        <p><strong>Phone:</strong> {{ orderDetails.customer.phone }}</p>
        <p><strong>Card:</strong> {{ orderDetails.customer.creditCard }}</p>
        <p>
          <strong>Exp. Date:</strong> {{ orderDetails.customer.expMonth }}/{{
            orderDetails.customer.expYear
          }}
        </p>
      </div>

      <table
        class="table-auto w-full mt-6 border-collapse border border-gray-300"
      >
        <thead>
          <tr>
            <th class="border border-gray-300 px-4 py-2">Item</th>
            <th class="border border-gray-300 px-4 py-2">Price</th>
            <th class="border border-gray-300 px-4 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in orderDetails.cartItems" :key="item.id">
            <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
            <td class="border border-gray-300 px-4 py-2">
              ${{ item.price.toFixed(2) }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.quantity }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4">
        <p>
          <strong>Subtotal:</strong> ${{ orderDetails.subtotal.toFixed(2) }}
        </p>
        <p>
          <strong>Surcharge (5%):</strong> ${{
            orderDetails.surcharge.toFixed(2)
          }}
        </p>
        <p><strong>Total:</strong> ${{ orderDetails.total.toFixed(2) }}</p>
      </div>
    </div>
  </div>

  <!-- Fallback content for when orderDetails is null -->
  <div v-else class="text-center mt-10">
    <h3 class="text-xl font-semibold">No order details found.</h3>
    <button class="btn btn-primary mt-4" @click="redirectToHome">
      Go to Homepage
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// Define the structure of orderDetails
interface Customer {
  name: string;
  address: string;
  email: string;
  phone: string;
  creditCard: string;
  expMonth: string;
  expYear: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderDetails {
  confirmationNumber: string;
  timestamp: string;
  customer: Customer;
  cartItems: CartItem[];
  subtotal: number;
  surcharge: number;
  total: number;
}

// Use the interface in ref
const orderDetails = ref<OrderDetails | null>(null);

onMounted(() => {
  const data = sessionStorage.getItem("orderDetails");
  if (data) {
    orderDetails.value = JSON.parse(data) as OrderDetails;
  }
});

const redirectToHome = () => {
  window.location.href = "/"; // Redirect to homepage
};
</script>
