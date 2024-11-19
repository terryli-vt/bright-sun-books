<template>
  <!-- Adds horizontal spacing (space-x-8) between sections on medium and larger screens, and vertical spacing (space-y-8) on smaller screens. On medium and larger screens, the vertical spacing is removed (md:space-y-0). -->
  <div
    class="flex flex-col md:flex-row md:items-center justify-center md:space-x-8 space-y-8 md:space-y-0"
  >
    <!-- First section: Welcome Image -->
    <section class="flex justify-center md:w-1/2">
      <a>
        <img
          src="@/assets/site/welcome.jpg"
          alt="Welcome Image"
          class="max-w-full h-auto"
        />
      </a>
    </section>

    <!-- Second section: Text and Button -->
    <section
      class="flex flex-col items-center justify-center text-center md:w-1/2 space-y-4"
    >
      <div class="space-y-2">
        <p class="text-xl font-semibold">Read and Purchase</p>
        <p class="text-2xl font-bold">Quality Books</p>
        <p class="text-lg">Anywhere, Anytime</p>
      </div>
      <RouterLink to="/category">
        <button
          class="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          Shop for Books
        </button>
      </RouterLink>
    </section>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>

<style scoped></style>
