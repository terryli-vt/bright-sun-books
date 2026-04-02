<template>
  <footer class="app-footer">
    <div class="footer-inner">

      <!-- Brand -->
      <span class="footer-brand">&copy; {{ year }} Bright Sun Bookstore</span>

      <!-- Links -->
      <nav class="footer-links">
        <RouterLink to="/">Directions</RouterLink>
        <RouterLink to="/">Contact</RouterLink>
      </nav>

      <!-- Social Icons -->
      <div class="footer-social">
        <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
          <i class="fab fa-facebook-f"></i>
        </a>
        <a href="https://x.com" target="_blank" rel="noopener" aria-label="X (Twitter)">
          <i class="fab fa-x-twitter"></i>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
          <i class="fab fa-instagram"></i>
        </a>
      </div>

    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<style scoped>
.app-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  padding: var(--space-lg) var(--space-lg);
}

.footer-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.footer-brand {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.footer-links a {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: var(--transition);
}

.footer-links a:hover {
  color: var(--color-text-primary);
}

.footer-social {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.footer-social a {
  font-size: 15px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: var(--transition);
}

.footer-social a:hover {
  color: var(--color-text-primary);
}

@media (max-width: 600px) {
  .footer-inner {
    flex-direction: column;
    gap: var(--space-sm);
    text-align: center;
  }
}
</style>
