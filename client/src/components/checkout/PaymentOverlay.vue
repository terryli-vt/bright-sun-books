<template>
  <Transition name="overlay-fade">
    <div
      v-if="show"
      class="payment-overlay"
      aria-live="polite"
      aria-label="Processing payment"
    >
      <div class="overlay-card">
        <div class="overlay-spinner"></div>
        <p class="overlay-title">Processing your payment…</p>
        <p class="overlay-sub">Please don't close this window.</p>
        <div class="overlay-steps">
          <div
            class="overlay-step"
            :class="{ done: step > 0, active: step === 0 }"
          >
            <span class="os-dot"></span>Contacting Stripe
          </div>
          <div
            class="overlay-step"
            :class="{ done: step > 1, active: step === 1 }"
          >
            <span class="os-dot"></span>Confirming payment
          </div>
          <div
            class="overlay-step"
            :class="{ done: step > 2, active: step === 2 }"
          >
            <span class="os-dot"></span>Saving your order
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  step: number;
}>();
</script>

<style scoped>
.payment-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.overlay-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-card);
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.overlay-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.overlay-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.overlay-sub {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.overlay-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
}

.overlay-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.overlay-step.active {
  background: #eff6ff;
  color: #1e40af;
  font-weight: 500;
}

.overlay-step.done {
  color: #166534;
}

.os-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
  opacity: 0.5;
}

.overlay-step.active .os-dot {
  opacity: 1;
  animation: pulse 1s ease-in-out infinite;
}

.overlay-step.done .os-dot {
  opacity: 1;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.6;
  }
}
</style>
