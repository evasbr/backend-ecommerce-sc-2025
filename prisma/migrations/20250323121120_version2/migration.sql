/*
  Warnings:

  - You are about to drop the column `product_category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `variation_thumbnail` on the `ProductVariation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "product_category";

-- AlterTable
ALTER TABLE "ProductVariation" DROP COLUMN "variation_thumbnail";
