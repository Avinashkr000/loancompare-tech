CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ELIGIBILITY_CHECK', 'OFFER_SELECTED', 'KYC_PENDING', 'APPROVED', 'DISBURSED', 'REJECTED', 'CANCELLED');
CREATE TYPE "LoanPurpose" AS ENUM ('PERSONAL', 'HOME_RENOVATION', 'EDUCATION', 'MEDICAL', 'DEBT_CONSOLIDATION', 'OTHER');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT,
  "creditScore" INTEGER,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

CREATE TABLE "Lender" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "baseRate" DECIMAL(5,2) NOT NULL,
  "processingFee" DECIMAL(6,3) NOT NULL,
  "minAmount" DECIMAL(14,2) NOT NULL,
  "maxAmount" DECIMAL(14,2) NOT NULL,
  "maxTenureMonths" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lender_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Lender_name_key" ON "Lender"("name");
CREATE UNIQUE INDEX "Lender_slug_key" ON "Lender"("slug");
CREATE INDEX "Lender_active_idx" ON "Lender"("active");

CREATE TABLE "LoanApplication" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "tenureMonths" INTEGER NOT NULL,
  "creditScore" INTEGER,
  "purpose" "LoanPurpose" NOT NULL,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
  "selectedOfferId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LoanApplication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LoanApplication_userId_createdAt_idx" ON "LoanApplication"("userId", "createdAt");
CREATE INDEX "LoanApplication_status_updatedAt_idx" ON "LoanApplication"("status", "updatedAt");

CREATE TABLE "LoanOffer" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT,
  "lenderId" TEXT NOT NULL,
  "annualRate" DECIMAL(5,2) NOT NULL,
  "processingFeePct" DECIMAL(6,3) NOT NULL,
  "emi" DECIMAL(14,2) NOT NULL,
  "totalInterest" DECIMAL(14,2) NOT NULL,
  "totalPayable" DECIMAL(14,2) NOT NULL,
  "eligibilityScore" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoanOffer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LoanOffer_applicationId_eligibilityScore_idx" ON "LoanOffer"("applicationId", "eligibilityScore");
CREATE INDEX "LoanOffer_lenderId_createdAt_idx" ON "LoanOffer"("lenderId", "createdAt");

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoanOffer" ADD CONSTRAINT "LoanOffer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoanOffer" ADD CONSTRAINT "LoanOffer_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
