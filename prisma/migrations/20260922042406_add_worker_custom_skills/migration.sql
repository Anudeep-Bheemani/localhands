-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN     "customSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];
