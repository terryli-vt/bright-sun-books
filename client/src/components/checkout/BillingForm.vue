<template>
  <section class="form-panel">
    <h2 class="panel-title">Billing Information</h2>

    <form @submit.prevent novalidate>
      <div class="field">
        <label for="name" class="field-label">Full Name</label>
        <input
          v-model="form.name"
          id="name"
          type="text"
          placeholder="Enter your full name"
          class="field-input"
          required
        />
      </div>

      <div class="field">
        <label for="address" class="field-label">Address</label>
        <input
          v-model="form.address"
          id="address"
          type="text"
          placeholder="Enter your address"
          class="field-input"
          required
        />
      </div>

      <div class="field" :class="{ 'field-error-state': phoneError }">
        <label for="phone" class="field-label">Phone Number</label>
        <input
          v-model="form.phone"
          id="phone"
          type="tel"
          placeholder="e.g. +1 (555) 000-0000"
          class="field-input"
          @blur="$emit('validate-phone')"
          required
        />
        <div v-if="phoneError" class="inline-error">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          Please enter a valid phone number (e.g. +1 555 000 0000).
        </div>
      </div>

      <div class="field" :class="{ 'field-error-state': emailError }">
        <label for="email" class="field-label">Email</label>
        <input
          v-model="form.email"
          id="email"
          type="email"
          placeholder="you@example.com"
          class="field-input"
          @blur="$emit('validate-email')"
          required
        />
        <div v-if="emailError" class="inline-error">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          Please enter a valid email address.
        </div>
      </div>

      <div class="field" :class="{ 'field-error-state': !!cardError }">
        <label class="field-label">Card Details</label>
        <div ref="cardMountEl" class="stripe-input"></div>
        <div v-if="cardError" class="inline-error">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          {{ cardError }}
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";

export interface BillingForm {
  name: string;
  address: string;
  phone: string;
  email: string;
}

defineProps<{
  phoneError: boolean;
  emailError: boolean;
  cardError: string;
}>();

defineEmits<{
  (e: "validate-phone"): void;
  (e: "validate-email"): void;
}>();

const form = defineModel<BillingForm>({ required: true });

const cardMountEl = ref<HTMLDivElement | null>(null);
defineExpose({ cardMountEl });
</script>

<style scoped>
.panel-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

.form-panel {
  display: flex;
  flex-direction: column;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-sm);
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.field-input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-btn);
  font-family: var(--font-base);
  font-size: 15px;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
}

.field-input::placeholder {
  color: #9ca3af;
}

.field-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

.field-error-state .field-input,
.field-error-state .stripe-input {
  border-color: #be123c;
  box-shadow: 0 0 0 3px rgba(190, 18, 60, 0.12);
}

.stripe-input {
  padding: 13px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-btn);
  background: var(--color-bg-primary);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  cursor: text;
}

.inline-error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: #be123c;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 6px;
  padding: 6px 10px;
}

.inline-error svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
</style>
