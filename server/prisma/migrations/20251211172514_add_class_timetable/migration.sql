-- CreateTable
CREATE TABLE "ClassTimetable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "facultyId" TEXT,
    "location" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassTimetable_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClassTimetable_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Note_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Note_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Note_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("courseId", "createdAt", "description", "facultyId", "fileUrl", "id", "moduleId", "title", "updatedAt") SELECT "courseId", "createdAt", "description", "facultyId", "fileUrl", "id", "moduleId", "title", "updatedAt" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
CREATE TABLE "new_VideoClass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "summaryShort" TEXT,
    "summaryMedium" TEXT,
    "summaryLong" TEXT,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "VideoClass_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VideoClass_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VideoClass_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VideoClass" ("courseId", "createdAt", "duration", "facultyId", "id", "moduleId", "summaryLong", "summaryMedium", "summaryShort", "title", "updatedAt", "videoUrl") SELECT "courseId", "createdAt", "duration", "facultyId", "id", "moduleId", "summaryLong", "summaryMedium", "summaryShort", "title", "updatedAt", "videoUrl" FROM "VideoClass";
DROP TABLE "VideoClass";
ALTER TABLE "new_VideoClass" RENAME TO "VideoClass";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
