<template>
  <div class="not-found-page">
    <div class="not-found-inner">
      <LottieAnimation
        :animationData="NotFoundAnimation"
        :loop="true"
        :autoplay="true"
        class="not-found-anim"
      />
      <h1 class="not-found-title">Page Not Found</h1>
      <p class="not-found-sub">Looks like this page wandered off the shelf.</p>
      <RouterLink to="/" class="not-found-cta">Go Back Home</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { LottieAnimation } from "lottie-web-vue";
import NotFoundAnimation from "@/assets/site/404.json";
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: var(--space-lg) var(--space-md);
}

.not-found-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  text-align: center;
  max-width: 480px;
  width: 100%;
  animation: fade-up 0.5s ease both;
}

.not-found-anim {
  width: 500px;
  aspect-ratio: 1280 / 720;
}

.not-found-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  margin: 0;
}

.not-found-sub {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: var(--lh-body);
  margin: 0;
}

.not-found-cta {
  display: inline-flex;
  align-items: center;
  margin-top: var(--space-xs);
  padding: 14px 36px;
  background: var(--color-text-primary);
  color: #ffffff;
  border-radius: var(--radius-pill);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);
}

.not-found-cta:hover {
  background: #333333;
  transform: translateY(-1px);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .not-found-page {
    padding: var(--space-md) var(--space-sm);
  }

  .not-found-anim {
    width: 300px;
    aspect-ratio: 1280 / 720;
  }

  .not-found-title {
    font-size: 24px;
  }

  .not-found-sub {
    font-size: 15px;
  }

  .not-found-cta {
    width: 100%;
    justify-content: center;
  }
}
</style>
