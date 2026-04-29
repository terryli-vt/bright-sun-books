<template>
  <div class="cart-page">

    <!-- ── Empty State ────────────────────────────────────────── -->
    <div v-if="cart.length === 0" class="cart-empty">
      <LottieAnimation
        :animationData="emptyCartAnimation"
        :loop="true"
        :autoplay="true"
        class="cart-empty-anim"
      />
      <p class="cart-empty-title">Your cart is empty</p>
      <p class="cart-empty-sub">Looks like you haven't added anything yet.</p>
      <RouterLink to="/category/Art" class="cart-empty-cta">Browse Books</RouterLink>
    </div>

    <!-- ── Cart Layout ────────────────────────────────────────── -->
    <div v-else class="cart-layout">

      <!-- Left: Item List -->
      <section class="cart-items">

        <!-- Header row -->
        <div class="cart-header">
          <RouterLink to="/category/Art" class="back-link">
            <i class="fas fa-arrow-left"></i> Continue Shopping
          </RouterLink>
          <h1 class="cart-title">
            Your Cart
            <span class="cart-count">{{ totalItems }}</span>
          </h1>
        </div>

        <!-- Items -->
        <ul class="item-list">
          <li v-for="item in cart" :key="item.id" class="cart-item">

            <!-- Cover -->
            <div class="item-cover-wrap">
              <img :src="item.imageUrl" :alt="item.title" class="item-cover" />
            </div>

            <!-- Details -->
            <div class="item-details">
              <p class="item-title">{{ item.title }}</p>
              <p class="item-author">{{ item.author }}</p>
              <p class="item-price">${{ item.price.toFixed(2) }}</p>
            </div>

            <!-- Controls -->
            <div class="item-controls">
              <div class="qty-stepper">
                <button class="qty-btn" @click="updateQuantity(item.id, 'decrease')" aria-label="Decrease">
                  <i class="fas fa-minus"></i>
                </button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" @click="updateQuantity(item.id, 'increase')" aria-label="Increase">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <p class="item-subtotal">${{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>

            <!-- Remove -->
            <button class="item-remove" @click="removeFromCart(item.id)" aria-label="Remove item">
              <i class="fas fa-xmark"></i>
            </button>

          </li>
        </ul>

        <!-- Clear all -->
        <div class="cart-footer">
          <button class="clear-btn" @click="clearCart">Clear Cart</button>
        </div>

      </section>

      <!-- Right: Order Summary -->
      <aside class="cart-summary">
        <h2 class="summary-title">Order Summary</h2>

        <div class="summary-rows">
          <div class="summary-row" v-for="item in cart" :key="item.id">
            <span class="summary-row-name">{{ item.title }} × {{ item.quantity }}</span>
            <span class="summary-row-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-total">
          <span>Total</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>

        <button class="checkout-btn" @click="goToCheckout">
          Checkout
          <i class="fas fa-arrow-right"></i>
        </button>

        <p class="summary-note">Taxes and shipping calculated at checkout.</p>
      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useCartStore } from "@/store/cart";
import { useCheckoutStore } from "@/store/checkout";
import { computeTotals } from "@/lib/pricing";
import { LottieAnimation } from "lottie-web-vue";
import emptyCartAnimation from "@/assets/site/empty-cart.json";

const cartStore = useCartStore();
const cart = cartStore.cart;
const checkoutStore = useCheckoutStore();
const router = useRouter();

const total = computed(() => computeTotals(cart).subtotal);

const totalItems = computed(() =>
  cart.reduce((acc, item) => acc + item.quantity, 0)
);

const removeFromCart = (bookId: number) => cartStore.removeFromCart(bookId);

const updateQuantity = (bookId: number, action: "increase" | "decrease") => {
  if (action === "decrease" && cart.find((i) => i.id === bookId)?.quantity === 1) {
    removeFromCart(bookId);
  } else {
    cartStore.updateQuantity(bookId, action);
  }
};

const clearCart = () => cartStore.clearCart();

const goToCheckout = () => {
  checkoutStore.allowCheckout();
  router.push("/checkout");
};
</script>

<style scoped>
/* ── Page ─────────────────────────────────────────────────────── */
.cart-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-lg) var(--space-lg);
  min-height: 80vh;
  overflow-x: hidden;
}

/* ── Empty State ──────────────────────────────────────────────── */
.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-xl) 0;
  text-align: center;
}

.cart-empty-anim {
  width: 280px;
  height: 280px;
}

.cart-empty-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.cart-empty-sub {
  font-size: 15px;
  color: var(--color-text-secondary);
}

.cart-empty-cta {
  display: inline-flex;
  align-items: center;
  margin-top: var(--space-xs);
  padding: 14px 32px;
  background: var(--color-text-primary);
  color: #ffffff;
  border-radius: var(--radius-pill);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);
}

.cart-empty-cta:hover {
  background: #333333;
  transform: translateY(-1px);
}

/* ── Layout ───────────────────────────────────────────────────── */
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--space-lg);
  align-items: start;
  width: 100%;
  max-width: 100%;
}

/* ── Left: Items ──────────────────────────────────────────────── */
.cart-items {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}

.cart-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: var(--transition);
  width: fit-content;
}

.back-link:hover {
  color: var(--color-text-primary);
}

.cart-title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* ── Item List ────────────────────────────────────────────────── */
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cart-item {
  display: grid;
  grid-template-columns: 72px 1fr auto auto;
  gap: var(--space-sm);
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

/* Cover */
.item-cover-wrap {
  aspect-ratio: 2 / 3;
  width: 72px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-bg-secondary);
  flex-shrink: 0;
}

.item-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Details */
.item-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-author {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* Controls */
.item-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qty-stepper {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-pill);
  padding: 3px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.qty-btn:hover {
  background: var(--color-border);
}

.qty-value {
  font-size: 14px;
  font-weight: 500;
  min-width: 24px;
  text-align: center;
  color: var(--color-text-primary);
}

.item-subtotal {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Remove */
.item-remove {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  flex-shrink: 0;
}

.item-remove:hover {
  background: var(--color-bg-secondary);
  color: var(--color-danger);
}

/* Footer */
.cart-footer {
  padding-top: var(--space-sm);
}

.clear-btn {
  border: none;
  background: transparent;
  font-family: var(--font-base);
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  transition: var(--transition);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.clear-btn:hover {
  color: var(--color-danger);
}

/* ── Right: Summary ───────────────────────────────────────────── */
.cart-summary {
  position: sticky;
  top: calc(60px + var(--space-lg));
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.summary-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-sm);
}

.summary-row-name {
  font-size: 13px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.summary-row-price {
  font-size: 13px;
  color: var(--color-text-primary);
  font-weight: 500;
  flex-shrink: 0;
}

.summary-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  margin-top: var(--space-xs);
  border: none;
  border-radius: var(--radius-pill);
  background: var(--color-text-primary);
  color: #ffffff;
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

.checkout-btn:hover {
  background: #333333;
  transform: translateY(-1px);
}

.summary-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 860px) {
  .cart-page {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 600px) {
  .cart-page {
    padding-left: var(--space-sm);
    padding-right: var(--space-sm);
  }

  .cart-item {
    grid-template-columns: 60px 1fr auto auto;
    gap: var(--space-xs);
  }

  .item-cover-wrap {
    width: 60px;
  }
}

@media (max-width: 480px) {
  .cart-page {
    padding-left: var(--space-xs);
    padding-right: var(--space-xs);
  }

  .cart-item {
    grid-template-columns: 56px 1fr 32px;
    grid-template-rows: auto auto;
    grid-template-areas:
      "cover details remove"
      "cover controls controls";
    align-items: start;
  }

  .item-cover-wrap {
    grid-area: cover;
    width: 56px;
  }

  .item-details {
    grid-area: details;
  }

  .item-controls {
    grid-area: controls;
    flex-direction: row;
    justify-content: flex-start;
    gap: var(--space-sm);
    padding-top: 8px;
  }

  .item-remove {
    grid-area: remove;
    align-self: start;
    margin-top: 2px;
  }
}
</style>
