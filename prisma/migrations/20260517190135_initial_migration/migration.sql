-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isNewCustomer" BOOLEAN NOT NULL DEFAULT false,
    "billingLine1" TEXT,
    "billingLine2" TEXT,
    "billingTown" TEXT,
    "billingCounty" TEXT,
    "billingPostcode" TEXT,
    "billingCountry" TEXT,
    "accountSameAsCustomer" BOOLEAN NOT NULL DEFAULT true,
    "accountCompanyName" TEXT,
    "accountContactName" TEXT,
    "accountEmail" TEXT,
    "salesperson" TEXT NOT NULL,
    "requirementType" TEXT NOT NULL,
    "requirementSubType" TEXT,
    "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 110,
    "additionalOngoingCosts" DOUBLE PRECISION,
    "additionalOutcosts" DOUBLE PRECISION,
    "projectName" TEXT,
    "projectDescription" TEXT,
    "estimatedStartDate" TIMESTAMP(3),
    "estimatedEndDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAmended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoursEntry" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "hours" DOUBLE PRECISION,
    "setupHours" DOUBLE PRECISION,
    "monthlyHours" DOUBLE PRECISION,
    "months" INTEGER,

    CONSTRAINT "HoursEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceScheduleItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "monthOffset" INTEGER,
    "date" TIMESTAMP(3),
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InvoiceScheduleItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HoursEntry" ADD CONSTRAINT "HoursEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceScheduleItem" ADD CONSTRAINT "InvoiceScheduleItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
