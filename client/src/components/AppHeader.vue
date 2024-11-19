<template>
  <header>
    <section>
      <RouterLink to="/">
        <img
          src="@/assets/site/logo.svg"
          alt="Bookstore Logo"
          width="100px"
          height="auto"
        />
      </RouterLink>
      <RouterLink to="/" tag="h1"> Bright Sun Books </RouterLink>
    </section>
    <section>
      <!-- Login Button and Hamburger Menu -->
    </section>
  </header>
</template>

<script>
/*   import HeaderDropdownMenu from "@/components/HeaderDropdown";
  import HeaderSearchBar from "@/components/HeaderSearchBar"; */
export default {
  name: "AppHeader" /* 
    components: { HeaderSearchBar, HeaderDropdownMenu },
    component: {
      HeaderDropdownMenu,
    }, */,
};
</script>

<style scoped>
header {
  background: var(--primary-color);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1em;
  flex-wrap: wrap;
}
</style>
