<template>
  <div class="confirm-page" v-if="orderDetails">

    <!-- Step Indicator -->
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
        Thank you, <strong>{{ orderDetails.customer.name }}</strong>. Your order has been placed successfully.
      </p>
      <p class="confirm-number">
        Confirmation # <strong>{{ orderDetails.confirmationNumber }}</strong>
      </p>
    </div>

    <!-- Detail card -->
    <div class="confirm-card">
      <div class="confirm-grid">

        <!-- Customer Info -->
        <section class="info-section">
          <h2 class="section-title">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
            Customer
          </h2>
          <dl class="info-list">
            <div class="info-row"><dt>Name</dt><dd>{{ orderDetails.customer.name }}</dd></div>
            <div class="info-row"><dt>Address</dt><dd>{{ orderDetails.customer.address }}</dd></div>
            <div class="info-row"><dt>Email</dt><dd>{{ orderDetails.customer.email }}</dd></div>
            <div class="info-row"><dt>Phone</dt><dd>{{ orderDetails.customer.phone }}</dd></div>
            <div class="info-row"><dt>Date</dt><dd>{{ formatDate(orderDetails.date) }}</dd></div>
          </dl>
        </section>

        <!-- Order Items -->
        <section class="info-section">
          <h2 class="section-title">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/><path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
            Items
          </h2>
          <ul class="item-list">
            <li v-for="item in orderDetails.items" :key="item.bookId" class="item-row">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-meta">× {{ item.quantity }}</span>
              <span class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </li>
          </ul>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${{ orderDetails.subtotal.toFixed(2) }}</span>
            </div>
            <div class="total-row">
              <span>Surcharge (5%)</span>
              <span>${{ orderDetails.surcharge.toFixed(2) }}</span>
            </div>
            <div class="totals-divider"></div>
            <div class="total-row total-final">
              <span>Total</span>
              <span>${{ orderDetails.total.toFixed(2) }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Actions -->
    <div class="confirm-actions">
      <button class="action-btn action-primary" @click="printReceipt">
        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9h8v3H6v-3zm2-4a1 1 0 100 2h4a1 1 0 100-2H8z" clip-rule="evenodd"/></svg>
        Print / Save as PDF
      </button>
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

interface Customer {
  name: string;
  address: string;
  email: string;
  phone: string;
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
    window.location.href = "/";
  }
});

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(date));
}

function printReceipt() {
  window.print();
}
</script>

<style scoped>
/* ── Page ─────────────────────────────────────────────────────── */
.confirm-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding-bottom: var(--space-xl);
}

/* ── Hero ────────────────────────────────────────────────────── */
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

/* ── Detail Card ─────────────────────────────────────────────── */
.confirm-card {
  margin: 0 var(--space-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
  padding: var(--space-md);
  animation: fade-up 0.5s ease 0.4s both;
}

.confirm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

/* ── Info Section ────────────────────────────────────────────── */
.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title svg {
  width: 14px;
  height: 14px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  gap: var(--space-sm);
  font-size: 14px;
}

.info-row dt {
  color: var(--color-text-secondary);
  min-width: 64px;
  flex-shrink: 0;
}

.info-row dd {
  color: var(--color-text-primary);
  font-weight: 500;
  margin: 0;
}

/* ── Item List ───────────────────────────────────────────────── */
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
}

.item-name {
  flex: 1;
  color: var(--color-text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  color: var(--color-text-secondary);
  font-size: 13px;
  flex-shrink: 0;
}

.item-price {
  color: var(--color-text-primary);
  font-weight: 600;
  flex-shrink: 0;
}

/* ── Totals ──────────────────────────────────────────────────── */
.totals {
  margin-top: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.totals-divider {
  height: 1px;
  background: var(--color-border);
  margin: 2px 0;
}

.total-final {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* ── Actions ─────────────────────────────────────────────────── */
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

/* ── Animations ──────────────────────────────────────────────── */
@keyframes check-pop {
  0% { opacity: 0; transform: scale(0.4) rotate(-10deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

@keyframes fade-up {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* ── Print styles ────────────────────────────────────────────── */
@media print {
  .confirm-actions,
  nav {
    display: none !important;
  }
  .confirm-page {
    padding: 0;
  }
  .confirm-card {
    margin: 0;
    box-shadow: none;
  }
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 700px) {
  .confirm-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  .confirm-hero,
  .confirm-card,
  .confirm-actions {
    padding-inline: var(--space-md);
    margin-inline: 0;
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
