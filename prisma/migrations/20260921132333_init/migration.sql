-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'WORKER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('REQUESTED', 'REJECTED', 'BOOKED', 'TRAVELLING', 'ARRIVED', 'WORKING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD', 'CASH');

-- CreateEnum
CREATE TYPE "AdditionalWorkStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('BEFORE', 'AFTER');

-- CreateEnum
CREATE TYPE "CustomJobStatus" AS ENUM ('OPEN', 'CLAIMED', 'BOOKED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerProfile" (
    "userId" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "baseLat" DOUBLE PRECISION NOT NULL,
    "baseLng" DOUBLE PRECISION NOT NULL,
    "baseAddress" TEXT NOT NULL DEFAULT '',
    "serviceRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "availableNow" BOOLEAN NOT NULL DEFAULT true,
    "acceptsCustomJobs" BOOLEAN NOT NULL DEFAULT false,
    "profilePhotoUrl" TEXT,
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "jobsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "WorkerPortfolio" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "indicativePrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerService" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WorkerService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerProduct" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WorkerProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomJob" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "locationLat" DOUBLE PRECISION NOT NULL,
    "locationLng" DOUBLE PRECISION NOT NULL,
    "locationAddress" TEXT NOT NULL DEFAULT '',
    "budget" DOUBLE PRECISION,
    "preferredTime" TEXT NOT NULL DEFAULT '',
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "status" "CustomJobStatus" NOT NULL DEFAULT 'OPEN',
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "voiceNoteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedByWorkerId" TEXT,

    CONSTRAINT "CustomJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomJobInterest" (
    "id" TEXT NOT NULL,
    "customJobId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "status" "InterestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomJobInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemPhoto" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "jobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "serviceId" TEXT,
    "customJobId" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'REQUESTED',
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "problemDescription" TEXT NOT NULL DEFAULT '',
    "problemVoiceNoteUrl" TEXT,
    "initialEstimate" DOUBLE PRECISION NOT NULL,
    "confirmedTotal" DOUBLE PRECISION,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paymentMethod" "PaymentMethod",
    "travelStartLat" DOUBLE PRECISION,
    "travelStartLng" DOUBLE PRECISION,
    "travelEndLat" DOUBLE PRECISION,
    "travelEndLng" DOUBLE PRECISION,
    "travelStartedAt" TIMESTAMP(3),
    "travelDurationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobStatusHistory" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdditionalWorkRequest" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "extraCost" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "status" "AdditionalWorkStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdditionalWorkRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobProduct" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "workerProductId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "priceAtTime" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "JobProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobEvidence" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "quality" INTEGER NOT NULL,
    "punctuality" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "pricingTransparency" INTEGER NOT NULL,
    "professionalism" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "voiceNoteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_categoryId_slug_key" ON "Service"("categoryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerService_workerId_serviceId_key" ON "WorkerService"("workerId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomJobInterest_customJobId_workerId_key" ON "CustomJobInterest"("customJobId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_customJobId_key" ON "Job"("customJobId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_jobId_key" ON "Review"("jobId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerPortfolio" ADD CONSTRAINT "WorkerPortfolio_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerService" ADD CONSTRAINT "WorkerService_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerService" ADD CONSTRAINT "WorkerService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerProduct" ADD CONSTRAINT "WorkerProduct_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomJob" ADD CONSTRAINT "CustomJob_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomJob" ADD CONSTRAINT "CustomJob_claimedByWorkerId_fkey" FOREIGN KEY ("claimedByWorkerId") REFERENCES "WorkerProfile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomJobInterest" ADD CONSTRAINT "CustomJobInterest_customJobId_fkey" FOREIGN KEY ("customJobId") REFERENCES "CustomJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomJobInterest" ADD CONSTRAINT "CustomJobInterest_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemPhoto" ADD CONSTRAINT "ProblemPhoto_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemPhoto" ADD CONSTRAINT "ProblemPhoto_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_customJobId_fkey" FOREIGN KEY ("customJobId") REFERENCES "CustomJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStatusHistory" ADD CONSTRAINT "JobStatusHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdditionalWorkRequest" ADD CONSTRAINT "AdditionalWorkRequest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobProduct" ADD CONSTRAINT "JobProduct_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobProduct" ADD CONSTRAINT "JobProduct_workerProductId_fkey" FOREIGN KEY ("workerProductId") REFERENCES "WorkerProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobEvidence" ADD CONSTRAINT "JobEvidence_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
