ALTER TABLE "EventRegistration"
ADD COLUMN "refundId" TEXT,
ADD COLUMN "refundStatus" TEXT,
ADD COLUMN "refundAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "refundRequestedAt" TIMESTAMP(3),
ADD COLUMN "refundRequestedById" TEXT;

CREATE UNIQUE INDEX "EventRegistration_refundId_key" ON "EventRegistration"("refundId");