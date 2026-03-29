-- AlterTable
ALTER TABLE "KiberonTransaction" ADD COLUMN     "comment" TEXT;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "homework" TEXT,
ADD COLUMN     "lessonNote" TEXT,
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "contractNumber" TEXT,
ADD COLUMN     "documentsIncomplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leadSource" TEXT,
ADD COLUMN     "managerComment" TEXT,
ADD COLUMN     "needsContact" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialLessonDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "StudentGroupHistory" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fromGroupId" TEXT,
    "toGroupId" TEXT,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "StudentGroupHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationProgram" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "groupId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lessonsCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentGroupHistory_studentId_movedAt_idx" ON "StudentGroupHistory"("studentId", "movedAt");

-- CreateIndex
CREATE INDEX "EducationProgram_branchId_isActive_idx" ON "EducationProgram"("branchId", "isActive");

-- CreateIndex
CREATE INDEX "EducationProgram_groupId_idx" ON "EducationProgram"("groupId");

-- AddForeignKey
ALTER TABLE "StudentGroupHistory" ADD CONSTRAINT "StudentGroupHistory_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroupHistory" ADD CONSTRAINT "StudentGroupHistory_fromGroupId_fkey" FOREIGN KEY ("fromGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroupHistory" ADD CONSTRAINT "StudentGroupHistory_toGroupId_fkey" FOREIGN KEY ("toGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationProgram" ADD CONSTRAINT "EducationProgram_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationProgram" ADD CONSTRAINT "EducationProgram_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
