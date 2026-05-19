-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "displayId" DROP DEFAULT;
DROP SEQUENCE "Order_displayId_seq";
