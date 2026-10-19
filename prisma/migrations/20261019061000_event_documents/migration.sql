CREATE TABLE "EventDocument" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "displayText" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "content" BYTEA NOT NULL,
    "size" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventDocumentDownload" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "notificationStatus" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "EventDocumentDownload_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventDocument_eventId_active_idx" ON "EventDocument"("eventId", "active");
CREATE INDEX "EventDocumentDownload_documentId_downloadedAt_idx" ON "EventDocumentDownload"("documentId", "downloadedAt");
ALTER TABLE "EventDocument" ADD CONSTRAINT "EventDocument_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventDocumentDownload" ADD CONSTRAINT "EventDocumentDownload_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "EventDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;