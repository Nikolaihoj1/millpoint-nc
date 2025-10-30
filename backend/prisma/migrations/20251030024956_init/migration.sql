-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NCProgram" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "workOrder" TEXT,
    "customer" TEXT NOT NULL,
    "description" TEXT,
    "filePath" TEXT,
    "hasCAD" BOOLEAN NOT NULL DEFAULT false,
    "hasDXF" BOOLEAN NOT NULL DEFAULT false,
    "cadFilePath" TEXT,
    "dxfFilePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "approverId" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "NCProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Offline',
    "ipAddress" TEXT,
    "serialPort" TEXT,
    "capabilities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetupSheet" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "machineType" TEXT NOT NULL,
    "safetyChecklist" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "SetupSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "setupSheetId" TEXT NOT NULL,
    "toolNumber" INTEGER NOT NULL,
    "toolName" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "offsetH" DOUBLE PRECISION NOT NULL,
    "offsetD" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OriginOffset" (
    "id" TEXT NOT NULL,
    "setupSheetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "z" DOUBLE PRECISION NOT NULL,
    "a" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "b" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "c" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "OriginOffset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fixture" (
    "id" TEXT NOT NULL,
    "setupSheetId" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "setupDescription" TEXT,

    CONSTRAINT "Fixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "setupSheetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "annotations" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramVersion" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "revision" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "changeLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ProgramVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "NCProgram_partNumber_revision_idx" ON "NCProgram"("partNumber", "revision");

-- CreateIndex
CREATE INDEX "NCProgram_machineId_idx" ON "NCProgram"("machineId");

-- CreateIndex
CREATE INDEX "NCProgram_status_idx" ON "NCProgram"("status");

-- CreateIndex
CREATE INDEX "NCProgram_customer_idx" ON "NCProgram"("customer");

-- CreateIndex
CREATE INDEX "Machine_status_idx" ON "Machine"("status");

-- CreateIndex
CREATE INDEX "Machine_type_idx" ON "Machine"("type");

-- CreateIndex
CREATE INDEX "SetupSheet_programId_idx" ON "SetupSheet"("programId");

-- CreateIndex
CREATE INDEX "SetupSheet_machineId_idx" ON "SetupSheet"("machineId");

-- CreateIndex
CREATE INDEX "Tool_setupSheetId_idx" ON "Tool"("setupSheetId");

-- CreateIndex
CREATE INDEX "OriginOffset_setupSheetId_idx" ON "OriginOffset"("setupSheetId");

-- CreateIndex
CREATE INDEX "Fixture_setupSheetId_idx" ON "Fixture"("setupSheetId");

-- CreateIndex
CREATE INDEX "Media_setupSheetId_idx" ON "Media"("setupSheetId");

-- CreateIndex
CREATE INDEX "ProgramVersion_programId_idx" ON "ProgramVersion"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramVersion_programId_versionNumber_key" ON "ProgramVersion"("programId", "versionNumber");

-- AddForeignKey
ALTER TABLE "NCProgram" ADD CONSTRAINT "NCProgram_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NCProgram" ADD CONSTRAINT "NCProgram_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NCProgram" ADD CONSTRAINT "NCProgram_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupSheet" ADD CONSTRAINT "SetupSheet_programId_fkey" FOREIGN KEY ("programId") REFERENCES "NCProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupSheet" ADD CONSTRAINT "SetupSheet_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupSheet" ADD CONSTRAINT "SetupSheet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupSheet" ADD CONSTRAINT "SetupSheet_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_setupSheetId_fkey" FOREIGN KEY ("setupSheetId") REFERENCES "SetupSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OriginOffset" ADD CONSTRAINT "OriginOffset_setupSheetId_fkey" FOREIGN KEY ("setupSheetId") REFERENCES "SetupSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_setupSheetId_fkey" FOREIGN KEY ("setupSheetId") REFERENCES "SetupSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_setupSheetId_fkey" FOREIGN KEY ("setupSheetId") REFERENCES "SetupSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_programId_fkey" FOREIGN KEY ("programId") REFERENCES "NCProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
