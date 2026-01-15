-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Media_url_idx" ON "Media"("url");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");
