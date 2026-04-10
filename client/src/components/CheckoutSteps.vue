<template>
  <nav class="steps-nav" aria-label="Checkout progress">
    <ol class="steps-list">
      <li
        v-for="(step, index) in steps"
        :key="step.label"
        class="step-item"
        :class="{
          'step-done': index + 1 < currentStep,
          'step-active': index + 1 === currentStep,
          'step-upcoming': index + 1 > currentStep,
        }"
      >
        <div class="step-circle">
          <!-- Checkmark for completed steps -->
          <svg v-if="index + 1 < currentStep" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span class="step-label">{{ step.label }}</span>
        <!-- Connector line -->
        <div v-if="index < steps.length - 1" class="step-connector"></div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  currentStep: number; // 1=Cart, 2=Details, 3=Payment, 4=Confirmation
}>();

const steps = [
  { label: "Cart" },
  { label: "Details" },
  { label: "Payment" },
  { label: "Confirmation" },
];
</script>

<style scoped>
.steps-nav {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-md) var(--space-lg);
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
}

.step-item {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-item:last-child {
  flex: 0 0 auto;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.step-circle svg {
  width: 14px;
  height: 14px;
}

.step-done .step-circle {
  background: var(--color-accent);
  color: #fff;
}

.step-active .step-circle {
  background: var(--color-text-primary);
  color: #fff;
  box-shadow: 0 0 0 4px rgba(29, 29, 31, 0.12);
}

.step-upcoming .step-circle {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.step-label {
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.step-done .step-label {
  color: var(--color-accent);
}

.step-active .step-label {
  color: var(--color-text-primary);
  font-weight: 600;
}

.step-upcoming .step-label {
  color: var(--color-text-secondary);
}

.step-connector {
  flex: 1;
  height: 1px;
  background: var(--color-border);
  margin: 0 10px;
  min-width: 20px;
}

.step-done ~ .step-connector,
.step-done .step-connector {
  background: var(--color-accent);
}

@media (max-width: 480px) {
  .steps-nav {
    padding: var(--space-sm) var(--space-md);
  }
  .step-label {
    display: none;
  }
  .step-connector {
    margin: 0 6px;
  }
}
</style>
