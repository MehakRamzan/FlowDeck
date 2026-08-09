import { prisma } from "../../config/prisma.js";
import { createActivity } from "../activities/activity.service.js";
import { createNotification } from "../notifications/notification.service.js";


async function verifyTaskAccess(
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

export async function createComment(
  userId: string,
  taskId: string,
  content: string
) {
  const task = await verifyTaskAccess(
  userId,
  taskId
);

  const comment =
    await prisma.comment.create({
      data: {
        content,
        taskId,
        authorId: userId,
      },
      include: {
        author: true,
      },
    });
    await createActivity({
  action: "CREATED",
  entity: "COMMENT",
  entityId: comment.id,
  userId,
  projectId: task.projectId,
});

  const recipients = new Set(
    [task.assigneeId, task.creatorId].filter(
      (recipientId): recipientId is string =>
        Boolean(recipientId) && recipientId !== userId
    )
  );

  await Promise.all(
    [...recipients].map((recipientId) =>
      createNotification({
        userId: recipientId,
        type: "TASK_COMMENT",
        category: "comments",
        title: "New task comment",
        message: `A new comment was added to “${task.title}”.`,
        link: `/projects/${task.projectId}/board`,
      })
    )
  );

  return comment;
}

export async function getTaskComments(
  userId: string,
  taskId: string
) {
  await verifyTaskAccess(
    userId,
    taskId
  );

  const comments =
    await prisma.comment.findMany({
      where: {
        taskId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        author: true,
      },
    });

  return comments;
}

export async function updateComment(
  userId: string,
  commentId: string,
  content: string
) {
  const comment =
    await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                team: true,
              },
            },
          },
        },
      },

    });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.authorId !== userId) {
    throw new Error(
      "You can only edit your own comments"
    );
  }

  const membership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId:
            comment.task.project.team.organizationId,
          userId,
        },
      },
    });

  if (!membership) {
    throw new Error(
      "You do not belong to this workspace"
    );
  }

  const updatedComment =
    await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content,
      },
      include: {
        author: true,
      },
    });

    await createActivity({
  action: "UPDATED",
  entity: "COMMENT",
  entityId: commentId,
  userId,
  projectId: comment.task.projectId,
});

  return updatedComment;
}

export async function deleteComment(
  userId: string,
  commentId: string
) {
  const comment =
    await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.authorId !== userId) {
    throw new Error(
      "You can only delete your own comments"
    );
  }

  const membership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId:
            comment.task.project.team.organizationId,
          userId,
        },
      },
    });

  if (!membership) {
    throw new Error(
      "You do not belong to this workspace"
    );
  }

  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  await createActivity({
  action: "DELETED",
  entity: "COMMENT",
  entityId: commentId,
  userId,
  projectId: comment.task.projectId,
});

}
