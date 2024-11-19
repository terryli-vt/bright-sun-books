<template>
  <div>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/category">Category</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style></style>
