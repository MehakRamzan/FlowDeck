ALTER TABLE "Task" ADD COLUMN "dueDate" TIMESTAMP(3);

CREATE INDEX "Task_projectId_dueDate_idx" ON "Task"("projectId", "dueDate");
