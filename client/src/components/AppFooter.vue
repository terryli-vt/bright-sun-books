<template>
  <footer class="bg-blue-500 text-white py-6 px-4">
    <!-- Footer Content -->
    <div
      class="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0"
    >
      <!-- Left Section -->
      <section>
        <p class="text-sm md:text-base">&copy; Bright Sun Bookstore</p>
      </section>

      <!-- Center Section -->
      <section class="flex space-x-4">
        <RouterLink to="/" class="hover:underline">Directions</RouterLink>
        <span>|</span>
        <RouterLink to="/" class="hover:underline">Contact</RouterLink>
      </section>

      <!-- Right Section -->
      <section class="flex space-x-4">
        <a
          href="https://facebook.com"
          target="_blank"
          class="hover:text-blue-800"
        >
          <i class="fab fa-facebook-f"></i>
        </a>
        <a href="https://x.com" target="_blank" class="hover:text-gray-800">
          <i class="fab fa-x-twitter"></i>
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          class="hover:text-pink-500"
        >
          <i class="fab fa-instagram"></i>
        </a>
      </section>
    </div>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
};
</script>

<style scoped></style>
