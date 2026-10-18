ALTER TABLE "Event"
ADD COLUMN "spectatorRatesConfigured" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Event"
ALTER COLUMN "spectatorSaturdayFee" SET DEFAULT 0,
ALTER COLUMN "spectatorSundayFee" SET DEFAULT 0,
ALTER COLUMN "spectatorWeekendFee" SET DEFAULT 0;

UPDATE "Event"
SET "spectatorSaturdayFee" = 0,
    "spectatorSundayFee" = 0,
    "spectatorWeekendFee" = 0,
    "spectatorRatesConfigured" = true
WHERE "slug" = 'drc-ultimate-rider';