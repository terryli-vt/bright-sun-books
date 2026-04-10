<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-${toast.type}`"
          role="alert"
        >
          <!-- Icon -->
          <svg v-if="toast.type === 'success'" class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="toast.type === 'error'" class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>

          <span class="toast-message">{{ toast.message }}</span>

          <button class="toast-close" @click="dismiss(toast.id)" aria-label="Dismiss">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from "@/composables/useToast";
const { toasts, dismiss } = useToast();
</script>

<style scoped>
.toast-stack {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
  width: calc(100vw - 48px);
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 10px;
  font-family: var(--font-base);
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  pointer-events: all;
  backdrop-filter: blur(8px);
}

.toast-success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.toast-error {
  background: #fff1f2;
  color: #9f1239;
  border: 1px solid #fecdd3;
}

.toast-info {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.toast-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-close svg {
  width: 14px;
  height: 14px;
}

/* Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
