CREATE TABLE IF NOT EXISTS "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"card_number" text NOT NULL,
	"card_exp_month" text NOT NULL,
	"card_exp_year" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "line_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"book_id" integer NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"confirmation_number" text NOT NULL,
	"date" timestamp NOT NULL,
	"customer_id" integer NOT NULL,
	CONSTRAINT "orders_confirmation_number_unique" UNIQUE("confirmation_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "line_items" ADD CONSTRAINT "line_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "line_items" ADD CONSTRAINT "line_items_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
