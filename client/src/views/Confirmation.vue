<template>
  <div class="confirm-page" v-if="order">
    <CheckoutSteps :currentStep="4" />

    <!-- Hero -->
    <div class="confirm-hero">
      <div class="checkmark-wrap">
        <img
          src="@/assets/site/checkmark.svg"
          alt="Order confirmed"
          class="checkmark-img"
        />
      </div>
      <h1 class="confirm-title">Order Confirmed!</h1>
      <p class="confirm-sub">
        Thank you, <strong>{{ order.customer.name }}</strong>. Your order has been placed successfully.
      </p>
      <p class="confirm-number">
        Confirmation # <strong>{{ order.confirmationNumber }}</strong>
      </p>
    </div>

    <OrderReceipt :order="order" />

    <!-- Actions -->
    <div class="confirm-actions">
      <button class="action-btn action-primary" @click="printReceipt">
        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9h8v3H6v-3zm2-4a1 1 0 100 2h4a1 1 0 100-2H8z" clip-rule="evenodd"/></svg>
        Print / Save as PDF
      </button>
      <RouterLink to="/orders" class="action-btn action-secondary">
        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
        View Order History
      </RouterLink>
      <RouterLink to="/category/Art" class="action-btn action-secondary">
        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        Continue Shopping
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import CheckoutSteps from "@/components/CheckoutSteps.vue";
import OrderReceipt from "@/components/OrderReceipt.vue";
import type { Order } from "@/types/order";

const order = ref<Order | null>(null);

onMounted(() => {
  const data = sessionStorage.getItem("orderDetails");
  if (data) {
    order.value = JSON.parse(data) as Order;
  } else {
    window.location.href = "/";
  }
});

function printReceipt() {
  window.print();
}
</script>

<style scoped>
.confirm-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding-bottom: var(--space-xl);
}

.confirm-hero {
  text-align: center;
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.checkmark-wrap {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: check-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

.checkmark-img {
  width: 100%;
  height: auto;
}

.confirm-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  animation: fade-up 0.5s ease 0.15s both;
}

.confirm-sub {
  font-size: 16px;
  color: var(--color-text-secondary);
  animation: fade-up 0.5s ease 0.25s both;
}

.confirm-number {
  font-size: 14px;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 6px 16px;
  animation: fade-up 0.5s ease 0.35s both;
}

.confirm-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: 0 var(--space-lg);
  animation: fade-up 0.5s ease 0.5s both;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  font-family: var(--font-base);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  border: none;
  transition: var(--transition);
}

.action-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.action-primary {
  background: var(--color-text-primary);
  color: #fff;
}

.action-primary:hover {
  background: #333;
  transform: translateY(-1px);
}

.action-secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.action-secondary:hover {
  background: var(--color-border);
}

@keyframes check-pop {
  0% { opacity: 0; transform: scale(0.4) rotate(-10deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

@keyframes fade-up {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media print {
  .confirm-actions,
  nav { display: none !important; }
  .confirm-page { padding: 0; }
}

@media (max-width: 700px) {
  .confirm-hero,
  .confirm-actions {
    padding-inline: var(--space-md);
  }
  .confirm-actions {
    flex-direction: column;
  }
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
