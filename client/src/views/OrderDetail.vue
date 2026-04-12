<template>
  <div class="page-root">
  <!-- Loading -->
  <div v-if="loading" class="state-box">
    <span class="spinner"></span>
    <p>Loading order…</p>
  </div>

  <!-- Error -->
  <div v-else-if="error" class="state-box state-error">
    <p>{{ error }}</p>
    <RouterLink to="/orders" class="back-link">← Back to Orders</RouterLink>
  </div>

  <!-- Order detail -->
  <div v-else-if="order" class="detail-page">
    <!-- Back -->
    <RouterLink to="/orders" class="back-link">← My Orders</RouterLink>

    <!-- Hero -->
    <div class="detail-hero">
      <h1 class="detail-title">Order Receipt</h1>
      <p class="detail-conf"># {{ order.confirmationNumber }}</p>
      <p class="detail-date">{{ formatDate(order.date) }}</p>
    </div>

    <!-- Card -->
    <div class="detail-card">
      <div class="detail-grid">

        <!-- Customer Info -->
        <section class="info-section">
          <h2 class="section-title">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
            Customer
          </h2>
          <dl class="info-list">
            <div class="info-row"><dt>Name</dt><dd>{{ order.customer.name }}</dd></div>
            <div class="info-row"><dt>Email</dt><dd>{{ order.customer.email }}</dd></div>
            <div class="info-row"><dt>Address</dt><dd>{{ order.customer.address }}</dd></div>
            <div class="info-row"><dt>Phone</dt><dd>{{ order.customer.phone }}</dd></div>
          </dl>
        </section>

        <!-- Items -->
        <section class="info-section">
          <h2 class="section-title">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/><path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
            Items
          </h2>
          <ul class="item-list">
            <li v-for="item in order.items" :key="item.bookId" class="item-row">
              <div class="item-cover-wrap">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.title"
                  class="item-cover"
                />
                <div v-else class="item-cover-placeholder">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
                </div>
              </div>
              <div class="item-info">
                <span class="item-name">{{ item.title }}</span>
                <div class="item-sub">
                  <span class="item-meta">× {{ item.quantity }}</span>
                  <span class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </li>
          </ul>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${{ order.subtotal.toFixed(2) }}</span>
            </div>
            <div class="total-row">
              <span>Surcharge (5%)</span>
              <span>${{ order.surcharge.toFixed(2) }}</span>
            </div>
            <div class="totals-divider"></div>
            <div class="total-row total-final">
              <span>Total</span>
              <span>${{ order.total.toFixed(2) }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Actions -->
    <div class="detail-actions">
      <button class="action-btn action-primary" @click="printReceipt">
        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9h8v3H6v-3zm2-4a1 1 0 100 2h4a1 1 0 100-2H8z" clip-rule="evenodd"/></svg>
        Print / Save as PDF
      </button>
      <RouterLink to="/orders" class="action-btn action-secondary">
        Back to Orders
      </RouterLink>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

interface Customer {
  name: string;
  email: string;
  address: string;
  phone: string;
}

interface OrderItem {
  bookId: number;
  title: string;
  author: string | null;
  imageUrl: string | null;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  confirmationNumber: string;
  date: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  surcharge: number;
  total: number;
}

const API = import.meta.env.VITE_API_URL;

const route = useRoute();
const router = useRouter();

const order = ref<Order | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await fetch(`${API}/orders/${route.params.id}`, { credentials: "include" });
    if (res.status === 403 || res.status === 401) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load order");
    order.value = data.order;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Something went wrong";
  } finally {
    loading.value = false;
  }
});

function formatDate(date: string) {
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
.page-root {
  min-height: 200px;
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

.state-error { color: var(--color-danger); }

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Page ─────────────────────────────────────────────────────── */
.detail-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding-bottom: var(--space-xl);
}

.back-link {
  display: inline-block;
  margin: var(--space-sm) var(--space-lg) 0;
  font-size: 14px;
  color: var(--color-accent);
  text-decoration: none;
}

.back-link:hover { text-decoration: underline; }

/* ── Hero ────────────────────────────────────────────────────── */
.detail-hero {
  text-align: center;
  padding: var(--space-md) var(--space-lg) var(--space-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.detail-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
}

.detail-conf {
  font-size: 13px;
  font-weight: 600;
  font-family: ui-monospace, monospace;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 4px 14px;
}

.detail-date {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* ── Card ────────────────────────────────────────────────────── */
.detail-card {
  margin: 0 var(--space-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
  padding: var(--space-md);
}

.detail-grid {
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

/* ── Item list ───────────────────────────────────────────────── */
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Cover */
.item-cover-wrap {
  flex-shrink: 0;
  width: 44px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

.item-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.item-cover-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-cover-placeholder svg {
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
}

/* Text */
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-sub {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.item-meta {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.item-price {
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 13px;
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
.detail-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: 0 var(--space-lg);
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

.action-secondary:hover { background: var(--color-border); }

/* ── Print ───────────────────────────────────────────────────── */
@media print {
  .detail-actions,
  .back-link,
  nav { display: none !important; }
  .detail-page { padding: 0; }
  .detail-card { margin: 0; box-shadow: none; }
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 700px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .detail-card,
  .detail-actions {
    margin-inline: var(--space-sm);
  }

  .back-link { margin-inline: var(--space-sm); }

  .detail-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
