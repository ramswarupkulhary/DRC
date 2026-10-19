ALTER TABLE "EventRegistration"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "cancelledById" TEXT,
ADD COLUMN "cancellationReason" TEXT;

UPDATE "EventRegistration" SET "status" = 'cancelled' WHERE "paymentStatus" = 'cancelled';