<template>
  <main class="home">

    <!-- ── Hero ────────────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-content">
        <p class="hero-eyebrow">Curated for curious minds.</p>
        <h1 class="hero-title">Read what<br>matters most.</h1>
        <p class="hero-subtitle">
          Discover quality books across every genre,<br class="br-desktop">
          delivered to your door.
        </p>
        <RouterLink to="/category/Art" class="hero-cta">Shop Books</RouterLink>
      </div>

      <div class="hero-visual">
        <img
          src="@/assets/site/welcome1.jpg"
          alt="A collection of books"
          class="hero-image"
        />
      </div>
    </section>

    <!-- ── Category Grid ───────────────────────────────────────── -->
    <section class="categories">
      <div class="section-inner">
        <h2 class="section-title">Browse by Category</h2>
        <div class="category-grid">
          <RouterLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/category/${cat.name}`"
            class="category-card"
          >
            <i :class="cat.icon" class="category-icon"></i>
            <span class="category-name">{{ cat.name }}</span>
          </RouterLink>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup lang="ts">
import { useCategoryStore } from "@/store/category";

const categoryStore = useCategoryStore();
const categories = categoryStore.categories;
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────────── */
.home {
  background: var(--color-bg-primary);
}

/* ── Hero ─────────────────────────────────────────────────────────── */
.hero {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg);
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  gap: var(--space-xl);
}

.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
}

.hero-eyebrow {
  font-size: 17px;
  font-weight: 500;
  color: var(--color-accent);
  letter-spacing: -0.01em;
}

.hero-title {
  font-size: clamp(48px, 5.5vw, 80px);
  font-weight: 600;
  line-height: var(--lh-heading);
  color: var(--color-text-primary);
  letter-spacing: -0.03em;
}

.hero-subtitle {
  font-size: 19px;
  font-weight: 400;
  line-height: var(--lh-body);
  color: var(--color-text-secondary);
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  padding: 16px 40px;
  background: var(--color-text-primary);
  color: #ffffff;
  border-radius: var(--radius-pill);
  font-size: 17px;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);
  margin-top: var(--space-xs);
}

.hero-cta:hover {
  background: #333333;
  transform: translateY(-1px);
}

.hero-visual {
  flex: 1;
}

.hero-image {
  width: 100%;
  height: 520px;
  object-fit: cover;
  border-radius: var(--radius-card);
  display: block;
}

/* ── Categories ─────────────────────────────────────────────────────── */
.categories {
  background: var(--color-bg-secondary);
  padding: var(--space-xl) var(--space-lg);
}

.section-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  line-height: var(--lh-heading);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-lg);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-sm);
}

.category-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-card);
  padding: 32px var(--space-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: var(--transition);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

.category-icon {
  font-size: 28px;
  color: var(--color-accent);
}

.category-name {
  font-size: 15px;
  font-weight: 500;
}

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .hero {
    flex-direction: column-reverse;
    padding: var(--space-lg) var(--space-md);
    min-height: auto;
    gap: var(--space-lg);
  }

  .hero-visual {
    width: 100%;
  }

  .hero-image {
    height: 260px;
  }

  .hero-content {
    align-items: center;
    text-align: center;
  }

  .br-desktop {
    display: none;
  }

  .categories {
    padding: var(--space-lg) var(--space-md);
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .category-card:last-child:nth-child(odd) {
    grid-column: span 2;
    max-width: 200px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>
