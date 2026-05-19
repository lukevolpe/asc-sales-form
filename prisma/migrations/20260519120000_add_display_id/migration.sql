-- Add human-readable display ID to orders
-- ⚠ STARTING NUMBER: change 1013 below to the confirmed cutover number before running
ALTER TABLE "Order" ADD COLUMN "displayId" INTEGER;

CREATE SEQUENCE "Order_displayId_seq" START 1013;
ALTER TABLE "Order" ALTER COLUMN "displayId" SET DEFAULT nextval('"Order_displayId_seq"');
ALTER SEQUENCE "Order_displayId_seq" OWNED BY "Order"."displayId";

ALTER TABLE "Order" ADD CONSTRAINT "Order_displayId_key" UNIQUE ("displayId");
