-- CreateEnum
CREATE TYPE "DynastySetting" AS ENUM ('FANTASY', 'SCI_FI', 'HISTORICAL', 'MODERN', 'HORROR', 'OTHER');

-- CreateEnum
CREATE TYPE "CharacterRole" AS ENUM ('HEIR', 'OPERATIVE', 'INFORMANT', 'SWORN_ENEMY', 'PATRIARCH', 'MATRIARCH', 'ALLY', 'RIVAL', 'ADVISOR', 'UNKNOWN', 'OTHER');

-- CreateEnum
CREATE TYPE "CharacterStyle" AS ENUM ('NOBLE', 'WARRIOR', 'MAGE', 'ROGUE', 'CLERIC', 'SCHOLAR', 'COMMONER', 'OTHER');

-- CreateEnum
CREATE TYPE "CharacterGender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('BLOOD', 'ADOPTED', 'ALLY', 'ENEMY', 'MARRIED', 'BETROTHED', 'MENTOR', 'RIVAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RelationshipTag" AS ENUM ('ESTRANGED', 'LOVER', 'RELUCTANT_DEBTOR', 'BETRAYER', 'PROTECTOR', 'RIVAL_HEIR', 'SECRET_CHILD', 'SWORN_ENEMY', 'UNLIKELY_ALLY', 'REDEEMED', 'FALLEN', 'EXILED', 'DECEASED', 'MISSING', 'CORRUPTED', 'CONFLICTED', 'DEVOTED', 'MANIPULATIVE', 'GRIEVING', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "NameStyle" AS ENUM ('FANTASY', 'SCI_FI', 'HISTORICAL', 'MODERN', 'HORROR', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dynasties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "setting" "DynastySetting" NOT NULL DEFAULT 'FANTASY',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "dynasties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "role" "CharacterRole" NOT NULL DEFAULT 'UNKNOWN',
    "style" "CharacterStyle" NOT NULL DEFAULT 'OTHER',
    "gender" "CharacterGender" NOT NULL DEFAULT 'UNKNOWN',
    "generation" INTEGER NOT NULL DEFAULT 0,
    "isFounder" BOOLEAN NOT NULL DEFAULT false,
    "isLost" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "posX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "posY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dynastyId" TEXT NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" TEXT NOT NULL,
    "type" "RelationshipType" NOT NULL DEFAULT 'UNKNOWN',
    "tag" "RelationshipTag",
    "hook" TEXT,
    "isMutual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dynastyId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_names" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "style" "NameStyle" NOT NULL DEFAULT 'FANTASY',
    "gender" "CharacterGender" NOT NULL DEFAULT 'UNKNOWN',
    "role" "CharacterRole",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "custom_names_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseId_key" ON "users"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "dynasties_slug_key" ON "dynasties"("slug");

-- CreateIndex
CREATE INDEX "dynasties_ownerId_idx" ON "dynasties"("ownerId");

-- CreateIndex
CREATE INDEX "characters_dynastyId_idx" ON "characters"("dynastyId");

-- CreateIndex
CREATE INDEX "relationships_dynastyId_idx" ON "relationships"("dynastyId");

-- CreateIndex
CREATE INDEX "relationships_fromId_idx" ON "relationships"("fromId");

-- CreateIndex
CREATE INDEX "relationships_toId_idx" ON "relationships"("toId");

-- CreateIndex
CREATE INDEX "custom_names_userId_idx" ON "custom_names"("userId");

-- AddForeignKey
ALTER TABLE "dynasties" ADD CONSTRAINT "dynasties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_dynastyId_fkey" FOREIGN KEY ("dynastyId") REFERENCES "dynasties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_dynastyId_fkey" FOREIGN KEY ("dynastyId") REFERENCES "dynasties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_toId_fkey" FOREIGN KEY ("toId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_names" ADD CONSTRAINT "custom_names_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
