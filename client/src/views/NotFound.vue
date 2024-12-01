<template>
  <div
    class="flex flex-col items-center justify-center h-[85vh] bg-gray-100 text-center"
  >
    <!-- <h1 class="text-6xl font-bold text-blue-600 mb-4">404</h1>
     -->
    <LottieAnimation
      :animationData="NotFoundAnimation"
      :loop="true"
      :autoplay="true"
      class="w-3/5 h-3/5"
    />
    <p class="text-xl text-gray-600 mb-6">
      Oops! The page you're looking for doesn't exist.
    </p>

    <router-link to="/" class="btn btn-primary"> Go Back Home </router-link>
  </div>
</template>

<script setup lang="ts">
import { LottieAnimation } from "lottie-web-vue";
import NotFoundAnimation from "@/assets/site/404.json";
</script>
