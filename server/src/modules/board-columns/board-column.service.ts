import { prisma } from "../../config/prisma.js";

type CreateBoardColumnInput = {
  name: string;
  position?: number;
};

type UpdateBoardColumnInput = {
  name?: string;
  position?: number;
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

export async function createBoardColumn(
  userId: string,
  projectId: string,
  input: CreateBoardColumnInput
) {
  await verifyProjectAccess(userId, projectId);

  let position = input.position;

  if (position === undefined) {
    const lastColumn =
      await prisma.boardColumn.findFirst({
        where: {
          projectId,
        },
        orderBy: {
          position: "desc",
        },
      });

    position = lastColumn
      ? lastColumn.position + 1
      : 0;
  }

  const existingColumn =
    await prisma.boardColumn.findUnique({
      where: {
        projectId_position: {
          projectId,
          position,
        },
      },
    });

  if (existingColumn) {
    throw new Error(
      "A column already exists at this position"
    );
  }

  const column = await prisma.boardColumn.create({
    data: {
      name: input.name,
      position,
      projectId,
    },
  });

  return column;
}

export async function getProjectColumns(
  userId: string,
  projectId: string
) {
  await verifyProjectAccess(userId, projectId);

  const columns = await prisma.boardColumn.findMany({
    where: {
      projectId,
    },
    orderBy: {
      position: "asc",
    },
  });

  return columns;
}

export async function getBoardColumnById(
  userId: string,
  columnId: string
) {
  const column = await prisma.boardColumn.findUnique({
    where: {
      id: columnId,
    },
    include: {
      project: {
        include: {
          team: true,
        },
      },
    },
  });

  if (!column) {
    throw new Error("Board column not found");
  }

  const membership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId:
            column.project.team.organizationId,
          userId,
        },
      },
    });

  if (!membership) {
    throw new Error(
      "You do not belong to this workspace"
    );
  }

  return column;
}

export async function updateBoardColumn(
  userId: string,
  columnId: string,
  input: UpdateBoardColumnInput
) {
  const column =
    await getBoardColumnById(
      userId,
      columnId
    );

  if (input.position !== undefined) {
    const existingColumn =
      await prisma.boardColumn.findUnique({
        where: {
          projectId_position: {
            projectId: column.projectId,
            position: input.position,
          },
        },
      });

    if (
      existingColumn &&
      existingColumn.id !== columnId
    ) {
      throw new Error(
        "A column already exists at this position"
      );
    }
  }

  const updatedColumn =
    await prisma.boardColumn.update({
      where: {
        id: columnId,
      },
      data: {
        ...(input.name !== undefined && {
          name: input.name,
        }),

        ...(input.position !== undefined && {
          position: input.position,
        }),
      },
    });

  return updatedColumn;
}

export async function deleteBoardColumn(
  userId: string,
  columnId: string
) {
  await getBoardColumnById(
    userId,
    columnId
  );

  await prisma.boardColumn.delete({
    where: {
      id: columnId,
    },
  });
}

export async function reorderBoardColumns(userId: string, projectId: string, columnIds: string[]) {
  await verifyProjectAccess(userId, projectId);
  const columns = await prisma.boardColumn.findMany({ where: { projectId }, select: { id: true } });
  if (columns.length !== columnIds.length || columns.some((column) => !columnIds.includes(column.id))) throw new Error("Column order must include every project column");
  await prisma.$transaction(async (tx) => {
    for (let index = 0; index < columnIds.length; index += 1) await tx.boardColumn.update({ where: { id: columnIds[index] }, data: { position: index + 10000 } });
    for (let index = 0; index < columnIds.length; index += 1) await tx.boardColumn.update({ where: { id: columnIds[index] }, data: { position: index } });
  });
}
