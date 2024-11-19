<template>
  <footer class="container">
    <section class="copyright">
      <p id="copyright-info">&#169; Bright Sun Bookstore</p>
    </section>
    <section class="links">
      <RouterLink to="/">directions</RouterLink>
      <RouterLink to="/">contact</RouterLink>
    </section>
    <section class="social-media-icons">
      <!-- <router-link to="/">
          <i class="fab fa-facebook-square fa-3x"></i>
        </router-link>
        <router-link to="/">
          <i class="fab fa-twitter-square fa-3x"></i>
        </router-link>
        <router-link to="/">
          <i class="fab fa-instagram-square fa-3x"></i>
        </router-link> -->
    </section>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
};
</script>

<style scoped>
footer {
  background: var(--primary-color);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  min-height: 80px;
  padding: 0px 20px;
}

#copyright-info {
  color: white;
  font-size: large;
}

.links {
  display: flex;
  flex-direction: row;
  gap: 10px;
  font-size: large;
}

#separator {
  color: white;
}

.social-media-icons {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 1em;
  font-size: 18px;
}
</style>
