<template>
  <div class="orders-page">
    <div class="page-header">
      <h1 class="page-title">Order History</h1>
      <p class="page-sub">All past orders placed with your account</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <span class="spinner"></span>
      <p>Loading your orders…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-box state-error">
      <p>{{ error }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="state-box">
      <p class="empty-msg">You haven't placed any orders yet.</p>
      <RouterLink to="/category/Art" class="action-btn action-primary">Start Shopping</RouterLink>
    </div>

    <!-- Order list -->
    <ul v-else class="order-list">
      <li v-for="order in orders" :key="order.id" class="order-card">
        <!-- Top row: date + total -->
        <div class="order-top">
          <span class="order-date">{{ formatDate(order.date) }}</span>
          <span class="order-total">${{ order.total.toFixed(2) }}</span>
        </div>

        <!-- Items -->
        <ul class="order-items">
          <li v-for="item in order.items" :key="item.bookId" class="order-item">
            <span class="order-item-title">{{ item.title }}</span>
            <span class="order-item-qty">× {{ item.quantity }}</span>
          </li>
        </ul>

        <!-- Bottom row: short conf# + link -->
        <div class="order-bottom">
          <span class="order-conf">#{{ shortConf(order.confirmationNumber) }}</span>
          <RouterLink :to="`/orders/${order.id}`" class="order-link">
            View Details
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </RouterLink>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";

interface OrderItem {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  confirmationNumber: string;
  date: string;
  items: OrderItem[];
  total: number;
}

const API = import.meta.env.VITE_API_URL;

const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await fetch(`${API}/orders`, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load orders");
    orders.value = data.orders;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Something went wrong";
  } finally {
    loading.value = false;
  }
});

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function shortConf(confirmationNumber: string) {
  return confirmationNumber.split("-")[0];
}
</script>

<style scoped>
.orders-page {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-lg) var(--space-xl);
}

.page-header {
  margin-bottom: var(--space-md);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
}

.page-sub {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* ── States ──────────────────────────────────────────────────── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xl) 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.state-error {
  color: var(--color-danger);
}

.empty-msg {
  font-size: 15px;
  color: var(--color-text-secondary);
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Order list ──────────────────────────────────────────────── */
.order-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.order-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-sm) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: var(--transition);
}

.order-card:hover {
  box-shadow: var(--shadow-card);
}

/* Top row */
.order-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.order-date {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.order-total {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* Items */
.order-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
}

.order-item-title {
  flex: 1;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-item-qty {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

/* Bottom row */
.order-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 6px;
  border-top: 1px solid var(--color-border);
}

.order-conf {
  font-size: 12px;
  font-family: ui-monospace, monospace;
  color: var(--color-text-secondary);
}

.order-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--color-text-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: var(--transition);
  flex-shrink: 0;
}

.order-link svg {
  width: 13px;
  height: 13px;
}

.order-link:hover {
  opacity: 0.85;
}

/* ── Buttons ─────────────────────────────────────────────────── */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);
}

.action-primary {
  background: var(--color-accent);
  color: #fff;
}

.action-primary:hover {
  opacity: 0.88;
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 600px) {
  .orders-page {
    padding-inline: var(--space-sm);
  }

  .order-card {
    padding: var(--space-sm);
  }
}
</style>
