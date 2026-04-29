<template>
  <aside class="summary-panel">
    <h2 class="panel-title">Order Summary</h2>

    <ul class="summary-items">
      <li v-for="item in items" :key="item.id" class="summary-item">
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
      :disabled="loading || disabled"
      @click="$emit('submit')"
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
</template>

<script setup lang="ts">
export interface SummaryItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

defineProps<{
  items: SummaryItem[];
  subtotal: number;
  surcharge: number;
  total: number;
  loading: boolean;
  disabled: boolean;
}>();

defineEmits<{
  (e: "submit"): void;
}>();
</script>

<style scoped>
.panel-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

.summary-panel {
  position: sticky;
  top: calc(60px + var(--space-md));
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
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
  min-width: 0;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 860px) {
  .summary-panel {
    position: static;
  }
}
</style>
