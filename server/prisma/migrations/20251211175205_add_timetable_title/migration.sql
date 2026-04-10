/*
  Warnings:

  - Added the required column `title` to the `Timetable` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Timetable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,
    "facultyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Timetable_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Timetable_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Timetable" ("courseId", "createdAt", "day", "endTime", "facultyId", "id", "room", "startTime", "updatedAt") SELECT "courseId", "createdAt", "day", "endTime", "facultyId", "id", "room", "startTime", "updatedAt" FROM "Timetable";
DROP TABLE "Timetable";
ALTER TABLE "new_Timetable" RENAME TO "Timetable";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
