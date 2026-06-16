-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "allowReviews" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showNewBadge" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showOutOfStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSaleBadge" BOOLEAN NOT NULL DEFAULT true;
