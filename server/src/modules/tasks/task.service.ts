import { prisma } from "../../config/prisma.js";
import { createActivity } from "../activities/activity.service.js";
import { createNotification } from "../notifications/notification.service.js";


type CreateTaskInput = {
  title: string;
  description?: string;
  position?: number;
  assigneeId?: string | null;
  dueDate?: Date | null;
};

type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  position?: number;
  assigneeId?: string | null;
  columnId?: string;
  dueDate?: Date | null;
};

async function verifyProjectAccess(
  userId: string,
  projectId: string
) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      team: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const membership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.team.organizationId,
          userId,
        },
      },
    });

  if (!membership) {
    throw new Error(
      "You do not belong to this workspace"
    );
  }

  return project;
}

async function verifyColumnBelongsToProject(
  columnId: string,
  projectId: string
) {
  const column = await prisma.boardColumn.findUnique({
    where: {
      id: columnId,
    },
  });

  if (!column) {
    throw new Error("Board column not found");
  }

  if (column.projectId !== projectId) {
    throw new Error(
      "Board column does not belong to this project"
    );
  }

  return column;
}

async function verifyAssignee(
  assigneeId: string | null | undefined,
  projectId: string
) {
  if (assigneeId === undefined || assigneeId === null) {
    return;
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      team: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const membership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.team.organizationId,
          userId: assigneeId,
        },
      },
    });

  if (!membership) {
    throw new Error(
      "Assignee does not belong to this workspace"
    );
  }
}

export async function createTask(
  userId: string,
  projectId: string,
  columnId: string,
  input: CreateTaskInput
) {
  await verifyProjectAccess(
    userId,
    projectId
  );

  await verifyColumnBelongsToProject(
    columnId,
    projectId
  );

  await verifyAssignee(
    input.assigneeId,
    projectId
  );

  let position = input.position;

  if (position === undefined) {
    const lastTask =
      await prisma.task.findFirst({
        where: {
          columnId,
        },
        orderBy: {
          position: "desc",
        },
      });

    position = lastTask
      ? lastTask.position + 1
      : 0;
  }

  const task = await prisma.task.create({
  data: {
    title: input.title,
    description: input.description,
    position,
    projectId,
    columnId,
    creatorId: userId,
    assigneeId: input.assigneeId,
    dueDate: input.dueDate,
  },
  });

  await createActivity({
  action: "CREATED",
  entity: "TASK",
  entityId: task.id,
  userId,
  projectId,
});

  if (task.assigneeId && task.assigneeId !== userId) {
    await createNotification({
      userId: task.assigneeId,
      type: "TASK_ASSIGNED",
      category: "taskAssignments",
      title: "New task assigned",
      message: `You were assigned to “${task.title}”.`,
      link: `/projects/${projectId}/board`,
    });
  }

  return task;
}

export async function getProjectTasks(
  userId: string,
  projectId: string
) {
  await verifyProjectAccess(
    userId,
    projectId
  );

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
    },
    orderBy: [
      {
        columnId: "asc",
      },
      {
        position: "asc",
      },
    ],
    include: {
      assignee: true,
      column: true,
    },
  });

  return tasks;
}

export async function getColumnTasks(
  userId: string,
  columnId: string
) {
  const column =
    await prisma.boardColumn.findUnique({
      where: {
        id: columnId,
      },
    });

  if (!column) {
    throw new Error("Board column not found");
  }

  await verifyProjectAccess(
    userId,
    column.projectId
  );

  const tasks = await prisma.task.findMany({
    where: {
      columnId,
    },
    orderBy: {
      position: "asc",
    },
    include: {
      assignee: true,
    },
  });

  return tasks;
}

export async function getTaskById(
  userId: string,
  taskId: string
) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: {
        include: {
          team: true,
        },
      },
      column: true,
      assignee: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const membership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId:
            task.project.team.organizationId,
          userId,
        },
      },
    });

  if (!membership) {
    throw new Error(
      "You do not belong to this workspace"
    );
  }

  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput
) {
  const task =
    await getTaskById(
      userId,
      taskId
    );

  if (input.columnId !== undefined) {
    await verifyColumnBelongsToProject(
      input.columnId,
      task.projectId
    );
  }

  await verifyAssignee(
    input.assigneeId,
    task.projectId
  );

  const updatedTask =
    await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...(input.title !== undefined && {
          title: input.title,
        }),

        ...(input.description !== undefined && {
          description: input.description,
        }),

        ...(input.position !== undefined && {
          position: input.position,
        }),

        ...(input.assigneeId !== undefined && {
          assigneeId: input.assigneeId,
        }),

        ...(input.columnId !== undefined && {
          columnId: input.columnId,
        }),

        ...(input.dueDate !== undefined && {
          dueDate: input.dueDate,
        }),
      },
      include: {
        assignee: true,
        column: true,
      },
    });

  if (
    input.assigneeId &&
    input.assigneeId !== task.assigneeId &&
    input.assigneeId !== userId
  ) {
    await createNotification({
      userId: input.assigneeId,
      type: "TASK_ASSIGNED",
      category: "taskAssignments",
      title: "Task assigned",
      message: `You were assigned to “${updatedTask.title}”.`,
      link: `/projects/${task.projectId}/board`,
    });
  }


    await createActivity({
  action: "UPDATED",
  entity: "TASK",
  entityId: updatedTask.id,
  userId,
  projectId: updatedTask.projectId,
});

  return updatedTask;
}

export async function deleteTask(
  userId: string,
  taskId: string
) {
  const task = await getTaskById(
    userId,
    taskId
  );

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  await createActivity({
    action: "DELETED",
    entity: "TASK",
    entityId: taskId,
    userId,
    projectId: task.projectId,
  });
}


export async function moveTask(
  userId: string,
  taskId: string,
  targetColumnId: string,
  targetPosition: number
) {
  const task = await getTaskById(
    userId,
    taskId
  );

  await verifyColumnBelongsToProject(
    targetColumnId,
    task.projectId
  );

  if (targetPosition < 0) {
    throw new Error(
      "Position cannot be negative"
    );
  }

  const oldColumnId = task.columnId;
  const oldPosition = task.position;

  const updatedTask =
    await prisma.$transaction(
      async (tx) => {
        if (oldColumnId === targetColumnId) {
          if (targetPosition < oldPosition) {
            await tx.task.updateMany({
              where: {
                columnId: oldColumnId,
                position: {
                  gte: targetPosition,
                  lt: oldPosition,
                },
              },
              data: {
                position: {
                  increment: 1,
                },
              },
            });
          } else if (
            targetPosition > oldPosition
          ) {
            await tx.task.updateMany({
              where: {
                columnId: oldColumnId,
                position: {
                  gt: oldPosition,
                  lte: targetPosition,
                },
              },
              data: {
                position: {
                  decrement: 1,
                },
              },
            });
          }
        } else {
          await tx.task.updateMany({
            where: {
              columnId: oldColumnId,
              position: {
                gt: oldPosition,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });

          await tx.task.updateMany({
            where: {
              columnId: targetColumnId,
              position: {
                gte: targetPosition,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
        }

        return tx.task.update({
          where: {
            id: taskId,
          },
          data: {
            columnId: targetColumnId,
            position: targetPosition,
          },
          include: {
            assignee: true,
            column: true,
          },
        });
      }
    );

  await createActivity({
    action: "MOVED",
    entity: "TASK",
    entityId: taskId,
    userId,
    projectId: task.projectId,
    metadata: {
      fromColumnId: oldColumnId,
      toColumnId: targetColumnId,
      fromPosition: oldPosition,
      toPosition: targetPosition,
    },
  });

  return updatedTask;
}
