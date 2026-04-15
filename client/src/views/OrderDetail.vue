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
      <RouterLink to="/orders" class="back-link">← My Orders</RouterLink>

      <div class="detail-hero">
        <h1 class="detail-title">Order Receipt</h1>
        <p class="detail-conf"># {{ order.confirmationNumber }}</p>
        <p class="detail-date">{{ formatOrderDate(order.date) }}</p>
      </div>

      <OrderReceipt :order="order" />

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
import OrderReceipt from "@/components/OrderReceipt.vue";
import { formatOrderDate } from "@/lib/formatDate";
import { apiFetch } from "@/lib/api";
import type { Order } from "@/types/order";

const route = useRoute();
const router = useRouter();

const order = ref<Order | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const data = await apiFetch<{ order: Order }>(`/orders/${route.params.id}`);
    order.value = data.order;
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 401 || status === 403) {
      router.push("/login");
      return;
    }
    error.value = err instanceof Error ? err.message : "Something went wrong";
  } finally {
    loading.value = false;
  }
});

function printReceipt() {
  window.print();
}
</script>

<style scoped>
.page-root {
  min-height: 200px;
}

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

@media print {
  .detail-actions,
  .back-link,
  nav { display: none !important; }
  .detail-page { padding: 0; }
}

@media (max-width: 700px) {
  .back-link { margin-inline: var(--space-sm); }
  .detail-actions {
    flex-direction: column;
    margin-inline: var(--space-sm);
  }
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
