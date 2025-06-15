/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'OWNER', 'PARTNER');

-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('CASH', 'BANK_ACCOUNT', 'CREDIT_CARD', 'INVESTMENT', 'PREPAID');

-- AlterTable
ALTER TABLE "FinancialAccount" ADD COLUMN     "type" "FinancialAccountType" NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
