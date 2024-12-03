<template>
  <div
    class="max-w-4xl mx-5 my-12 p-6 bg-slate-50 shadow-lg rounded-lg md:mx-auto"
    v-if="orderDetails"
  >
    <div class="text-center space-y-4">
      <div class="flex items-center justify-center mx-auto">
        <img
          src="@/assets/site/checkmark.svg"
          alt="Checkmark Icon"
          class="w-20 h-auto"
        />
      </div>
      <h2 class="text-4xl font-bold text-green-600">
        Thank you for shopping with us!
      </h2>
    </div>

    <div class="mt-10 text-center">
      <h3 class="text-2xl font-semibold text-gray-700 mb-6">
        Here is your order details:
      </h3>
      <div class="space-y-4 text-gray-600">
        <p>
          <strong>Confirmation Number:</strong>
          {{ orderDetails.confirmationNumber }}
        </p>
        <p class="mt-2">
          <strong>Timestamp:</strong> {{ formatDate(orderDetails.date) }}
        </p>
        <div class="mt-8">
          <strong>Customer Information:</strong>
          <p>{{ orderDetails.customer.name }}</p>
          <p>{{ orderDetails.customer.address }}</p>
          <p>{{ orderDetails.customer.email }}</p>
          <p>{{ orderDetails.customer.phone }}</p>
          <p>
            {{ maskCard(orderDetails.customer.creditCard) }}({{
              orderDetails.customer.expMonth
            }}/{{ orderDetails.customer.expYear }})
          </p>
        </div>
      </div>

      <table class="table w-full mt-10">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-2">Item</th>
            <th class="py-2">Price</th>
            <th class="py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in orderDetails.items" :key="item.bookId">
            <td class="py-2">{{ item.name }}</td>
            <td class="py-2">${{ item.price.toFixed(2) }}</td>
            <td class="py-2">{{ item.quantity }}</td>
          </tr>
        </tbody>
      </table>

      <div class="mt-6 text-center space-y-2">
        <p class="text-gray-700">
          <strong>Subtotal:</strong> ${{ orderDetails.subtotal.toFixed(2) }}
        </p>
        <p class="text-gray-700">
          <strong>Surcharge (5%):</strong> ${{
            orderDetails.surcharge.toFixed(2)
          }}
        </p>
        <div class="divider"></div>
        <p class="text-lg text-gray-900 font-semibold">
          <strong>Total:</strong> ${{ orderDetails.total.toFixed(2) }}
        </p>
      </div>
    </div>
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
  bookId: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderDetails {
  confirmationNumber: string;
  date: Date;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  surcharge: number;
  total: number;
}

const orderDetails = ref<OrderDetails | null>(null);

onMounted(() => {
  const data = sessionStorage.getItem("orderDetails");
  if (data) {
    orderDetails.value = JSON.parse(data) as OrderDetails;
  } else {
    window.location.href = "/"; // Redirect if no data
  }
});

function formatDate(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
  return formatter.format(new Date(date));
}

function maskCard(cardNumber: string) {
  const visibleDigits = cardNumber.slice(-4);
  const masked = "**** **** ****";
  return `${masked} ${visibleDigits}`;
}
</script>
