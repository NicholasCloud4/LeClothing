CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_checkout_session_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cart_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "reserved_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_status_reserved_until_idx" ON "orders" USING btree ("status","reserved_until");--> statement-breakpoint
CREATE INDEX "orders_cart_id_idx" ON "orders" USING btree ("cart_id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id");