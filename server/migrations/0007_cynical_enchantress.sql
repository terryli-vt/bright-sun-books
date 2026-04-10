ALTER TABLE "orders" ADD COLUMN "payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN IF EXISTS "card_number";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN IF EXISTS "card_exp_month";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN IF EXISTS "card_exp_year";