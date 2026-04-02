<template>
  <div class="booklist">

    <!-- ── Loading Skeletons ─────────────────────────────────── -->
    <div v-if="loading" class="book-grid">
      <div v-for="n in 8" :key="n" class="book-card">
        <div class="book-cover-wrap skeleton-block"></div>
        <div class="book-info">
          <div class="skeleton-line" style="width: 75%"></div>
          <div class="skeleton-line" style="width: 45%; margin-top: 6px"></div>
          <div class="skeleton-line" style="width: 30%; margin-top: 10px"></div>
          <div class="skeleton-btn"></div>
        </div>
      </div>
    </div>

    <!-- ── Book Grid ──────────────────────────────────────────── -->
    <Transition name="fade-list" mode="out-in">
      <div v-if="!loading && books.length > 0" class="book-grid">
        <div
          v-for="book in books"
          :key="book.id"
          class="book-card"
        >
          <!-- Cover -->
          <div class="book-cover-wrap">
            <img
              :src="book.imageUrl"
              :alt="book.title"
              class="book-cover"
              loading="lazy"
            />
          </div>

          <!-- Info -->
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
            <p class="book-price">${{ book.price.toFixed(2) }}</p>
            <button
              class="add-btn"
              :class="{ 'add-btn--added': justAdded[book.id] }"
              @click="addToCart(book)"
            >
              <i
                class="fas"
                :class="justAdded[book.id] ? 'fa-check' : 'fa-plus'"
              ></i>
              {{ justAdded[book.id] ? "Added" : "Add to Cart" }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Empty State ─────────────────────────────────────── -->
      <div v-else-if="!loading" class="book-empty">
        <i class="fas fa-books book-empty-icon"></i>
        <p>No books found in this category.</p>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watchEffect } from "vue";
import cartStore from "@/store/cart";

const props = defineProps({
  selectedCategoryId: {
    type: Number,
    required: true,
  },
});

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
}

const books = ref<Book[]>([]);
const loading = ref(false);
const justAdded = reactive<Record<number, boolean>>({});

const fetchBooks = async (categoryId: number) => {
  loading.value = true;
  books.value = [];
  try {
    const response = await fetch(
      `http://localhost:8000/books/categories/${categoryId}`
    );
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    books.value = await response.json();
  } catch (error) {
    console.error("Failed to fetch books:", error);
  } finally {
    loading.value = false;
  }
};

watchEffect(() => {
  fetchBooks(props.selectedCategoryId);
});

const addToCart = (book: Book) => {
  cartStore.addToCart({ ...book, quantity: 1 });
  justAdded[book.id] = true;
  setTimeout(() => {
    delete justAdded[book.id];
  }, 1500);
};
</script>

<style scoped>
/* ── Page Wrapper ──────────────────────────────────────────────── */
.booklist {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-lg) var(--space-lg);
  min-height: 60vh;
}

/* ── Grid ─────────────────────────────────────────────────────── */
.book-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

/* ── Card ─────────────────────────────────────────────────────── */
.book-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

/* ── Cover ────────────────────────────────────────────────────── */
.book-cover-wrap {
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: var(--color-border);
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: var(--transition);
}

.book-card:hover .book-cover {
  transform: scale(1.03);
}

/* ── Info ─────────────────────────────────────────────────────── */
.book-info {
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.book-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-text-primary);
  height: calc(14px * 1.4 * 2); /* always reserve exactly 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-price {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-top: auto; /* pushes price + button to the bottom of the card */
}

/* ── Add to Cart Button ───────────────────────────────────────── */
.add-btn {
  width: 100%;
  padding: 10px;
  margin-top: var(--space-sm);
  border: none;
  border-radius: var(--radius-pill);
  background: var(--color-text-primary);
  color: #ffffff;
  font-family: var(--font-base);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: var(--transition);
}

.add-btn:hover {
  background: #333333;
}

.add-btn--added {
  background: #34C759;
}

.add-btn--added:hover {
  background: #2aab4b;
}

/* ── Skeleton ─────────────────────────────────────────────────── */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

.skeleton-block,
.skeleton-line,
.skeleton-btn {
  background: linear-gradient(
    90deg,
    #e8e8e8 25%,
    #f0f0f0 50%,
    #e8e8e8 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 6px;
}

.skeleton-block {
  aspect-ratio: 2 / 3;
  border-radius: 0;
}

.skeleton-line {
  height: 14px;
}

.skeleton-btn {
  height: 36px;
  border-radius: var(--radius-pill);
  margin-top: var(--space-sm);
}

/* ── Empty State ─────────────────────────────────────────────── */
.book-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-xl) 0;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.book-empty-icon {
  font-size: 40px;
  opacity: 0.3;
}

/* ── List Transition ─────────────────────────────────────────── */
.fade-list-enter-active,
.fade-list-leave-active {
  transition: opacity 0.2s ease;
}
.fade-list-enter-from,
.fade-list-leave-to {
  opacity: 0;
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .book-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 700px) {
  .booklist {
    padding: var(--space-md) var(--space-md);
  }

  .book-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }
}
</style>
