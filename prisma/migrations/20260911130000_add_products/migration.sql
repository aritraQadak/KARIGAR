CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artisanId" TEXT NOT NULL,
    "publishKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "stock" INTEGER NOT NULL,
    "detailsJson" TEXT NOT NULL,
    "mediaJson" TEXT NOT NULL,
    "evidenceJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Product_artisanId_publishKey_key" ON "Product"("artisanId", "publishKey");
CREATE INDEX "Product_artisanId_createdAt_idx" ON "Product"("artisanId", "createdAt");
