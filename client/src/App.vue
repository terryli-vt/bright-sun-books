<template>
  <div id="app">
    <AppHeader />
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();
onMounted(() => authStore.fetchMe());
</script>

<style></style>
