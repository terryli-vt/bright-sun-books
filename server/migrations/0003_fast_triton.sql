ALTER TABLE "books" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "price" SET DEFAULT '0';