ALTER TABLE "Event"
ADD COLUMN "stayEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stayPrice" INTEGER NOT NULL DEFAULT 1599,
ADD COLUMN "stayTotalTents" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "stayConfigured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "spectatorSaturdayFee" INTEGER NOT NULL DEFAULT 499,
ADD COLUMN "spectatorSundayFee" INTEGER NOT NULL DEFAULT 499,
ADD COLUMN "spectatorWeekendFee" INTEGER NOT NULL DEFAULT 999,
ADD COLUMN "spectatorFullMealName" TEXT NOT NULL DEFAULT 'Two-day meal package',
ADD COLUMN "spectatorFullMealDetails" TEXT NOT NULL DEFAULT '2 breakfasts, 2 lunches and 1 dinner',
ADD COLUMN "spectatorFullMealFee" INTEGER NOT NULL DEFAULT 1999,
ADD COLUMN "spectatorDayMealName" TEXT NOT NULL DEFAULT 'Day meal package',
ADD COLUMN "spectatorDayMealDetails" TEXT NOT NULL DEFAULT '1 breakfast and 1 lunch',
ADD COLUMN "spectatorDayMealFee" INTEGER NOT NULL DEFAULT 599,
ADD COLUMN "registrationUrl" TEXT;

ALTER TABLE "EventRegistration"
ADD COLUMN "stayBooked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stayAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reservationExpiresAt" TIMESTAMP(3),
ADD COLUMN "registrationType" TEXT NOT NULL DEFAULT 'rider',
ADD COLUMN "attendanceDays" TEXT,
ADD COLUMN "membershipDiscount" INTEGER NOT NULL DEFAULT 0;

UPDATE "Event"
SET "stayEnabled" = true, "stayPrice" = 1599, "stayTotalTents" = 50, "stayConfigured" = true,
	"spectatorSaturdayFee" = 499, "spectatorSundayFee" = 499, "spectatorWeekendFee" = 999
	, "spectatorFullMealName" = 'Two-day meal package',
	"spectatorFullMealDetails" = '2 breakfasts, 2 lunches and 1 dinner',
	"spectatorFullMealFee" = 1999,
	"spectatorDayMealName" = 'Day meal package',
	"spectatorDayMealDetails" = '1 breakfast and 1 lunch',
	"spectatorDayMealFee" = 599,
	"registrationUrl" = '/events/drc-ultimate-rider/register'
WHERE "slug" = 'drc-ultimate-rider';