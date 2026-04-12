<template>
  <div id="app">
    <AppHeader />
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </Transition>
    </RouterView>
    <AppFooter />
    <AppToast />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import AppToast from "./components/AppToast.vue";
</script>

<style></style>
