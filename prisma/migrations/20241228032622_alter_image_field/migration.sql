/*
  Warnings:

  - You are about to drop the column `file` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `image` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "file",
ADD COLUMN     "image" BYTEA NOT NULL;
