<template>
  <div class="receipt-card">
    <div class="receipt-grid">
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
          <div class="info-row"><dt>Date</dt><dd>{{ formatOrderDate(order.date) }}</dd></div>
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
            <div v-if="showCovers" class="item-cover-wrap">
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
</template>

<script setup lang="ts">
import type { Order } from "@/types/order";
import { formatOrderDate } from "@/lib/formatDate";

withDefaults(
  defineProps<{
    order: Order;
    showCovers?: boolean;
  }>(),
  { showCovers: true },
);
</script>

<style scoped>
.receipt-card {
  margin: 0 var(--space-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
  padding: var(--space-md);
}

.receipt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

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

.item-cover-wrap {
  flex-shrink: 0;
  width: 44px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
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

@media (max-width: 700px) {
  .receipt-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  .receipt-card {
    margin-inline: var(--space-sm);
  }
}
</style>
