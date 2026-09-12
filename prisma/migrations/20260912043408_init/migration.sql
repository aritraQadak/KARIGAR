-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ARTISAN',
    "provider" TEXT,
    "providerAccountId" TEXT,
    "avatarUrl" TEXT,
    "craftType" TEXT,
    "state" TEXT,
    "district" TEXT,
    "yearsOfExperience" INTEGER,
    "businessName" TEXT,
    "giTagNumber" TEXT,
    "clusterName" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("businessName", "clusterName", "craftType", "createdAt", "district", "email", "fullName", "giTagNumber", "id", "isActive", "isVerified", "mobile", "password", "role", "state", "updatedAt", "yearsOfExperience") SELECT "businessName", "clusterName", "craftType", "createdAt", "district", "email", "fullName", "giTagNumber", "id", "isActive", "isVerified", "mobile", "password", "role", "state", "updatedAt", "yearsOfExperience" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
