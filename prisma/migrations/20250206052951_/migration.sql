/*
  Warnings:

  - Added the required column `nomorNasabah` to the `nasabah` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `mstrkategorisampah` ADD COLUMN `emisiKarbon` DOUBLE NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `nasabah` ADD COLUMN `nomorNasabah` VARCHAR(191) NOT NULL;
