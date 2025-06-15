-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'NOT_SENT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ_PROJECTS', 'CREATE_PROJECTS', 'UPDATE_PROJECTS', 'DELETE_PROJECTS', 'MANAGE_USERS', 'MANAGE_PROJECTS', 'VIEW_OWN_PROJECT', 'UPDATE_OWN_PROJECT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(200) NOT NULL,
    "profile_image" VARCHAR(255),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "email_status" "EmailStatus" NOT NULL DEFAULT 'NOT_SENT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
    "assignee_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_status" "EmailStatus" NOT NULL DEFAULT 'NOT_SENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_key" ON "projects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "projects_description_key" ON "projects"("description");

-- CreateIndex
CREATE UNIQUE INDEX "projects_assignee_id_key" ON "projects"("assignee_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
