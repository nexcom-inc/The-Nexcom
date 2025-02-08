/*
  Warnings:

  - You are about to drop the column `providerId` on the `user_providers` table. All the data in the column will be lost.
  - You are about to drop the `providers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,provider]` on the table `user_providers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Providers" AS ENUM ('GOOGLE', 'GITHUB', 'FACEBOOK', 'EMAILANDPASSWORD', 'SSO');

-- DropForeignKey
ALTER TABLE "user_providers" DROP CONSTRAINT "user_providers_providerId_fkey";

-- DropIndex
DROP INDEX "user_provider_unique_idx";

-- DropIndex
DROP INDEX "user_providers_providerId_key";

-- AlterTable
ALTER TABLE "user_providers" DROP COLUMN "providerId",
ADD COLUMN     "provider" "Providers" NOT NULL DEFAULT 'EMAILANDPASSWORD';

-- DropTable
DROP TABLE "providers";

-- DropEnum
DROP TYPE "ProviderName";

-- CreateIndex
CREATE UNIQUE INDEX "user_provider_unique_idx" ON "user_providers"("userId", "provider");
