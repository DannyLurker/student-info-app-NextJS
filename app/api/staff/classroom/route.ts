import { prisma } from "@/db/prisma";
import { ClassSection, Grade, Major } from "@/lib/constants/class";
import { badRequest, handleError } from "@/lib/errors";
import { getFullClassLabel } from "@/lib/utils/labels";
import { createClassSchema, updateClassSchema } from "@/lib/utils/zodSchema";
import { validateManagementSession } from "@/lib/validation/guards";

export async function GET(req: Request) {
  try {
    validateManagementSession();

    const classroomData = await prisma.classroom.findMany({});

    return Response.json(
      {
        data: classroomData,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(GET) /api/staff/class",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    validateManagementSession();

    const rawData = await req.json();

    // from frontend
    const data = createClassSchema.parse(rawData);

    // from DB
    const classroomData = await prisma.classroom.findMany({});

    const classroomSet = new Set(
      classroomData.map(
        (classroom) =>
          `${classroom.grade}-${classroom.major}-${classroom.section}`,
      ),
    );

    data.forEach((d) => {
      const classroomKey = `${d.grade}-${d.major}-${d.section}`;

      if (classroomSet.has(classroomKey)) {
        const classLabel = getFullClassLabel(
          d.grade as Grade,
          d.major as Major,
          d.section as ClassSection,
        );
        throw badRequest(`${classLabel} is already exists`);
      }
    });

    await prisma.classroom.createMany({
      data: data,
    });

    return Response.json({ message: "Successfully created " }, { status: 201 });
  } catch (error) {
    console.error("API_ERROR", {
      route: "(POST) /api/staff/class",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

type classServer = {
  id: number;
  grade: Grade;
  major: Major;
  section: string | ClassSection;
  homeroomTeacherId: string | null;
};

type classClient = {
  id: number;
  classSchema: {
    grade: Grade;
    major: Major;
    section: ClassSection;
  };
  homeroomTeacherId?: string;
};

function compareClassAtributes(
  classServer: classServer,
  classClient: classClient,
) {
  const changedData: any = {};

  const isGradeChanged = classServer.grade !== classClient.classSchema.grade;

  if (isGradeChanged) changedData.grade = classClient.classSchema.grade;

  const isMajorChanged = classServer.major !== classClient.classSchema.major;

  if (isMajorChanged) changedData.major = classClient.classSchema.major;

  const isClassSectionChanged =
    classServer.section !== classClient.classSchema.section;

  if (isClassSectionChanged)
    changedData.section = classClient.classSchema.section;

  const isTeacherIdChanged =
    classServer.homeroomTeacherId !== classClient.homeroomTeacherId;

  if (isTeacherIdChanged)
    changedData.homeroomTeacherId =
      classClient.homeroomTeacherId == ""
        ? null
        : classClient.homeroomTeacherId;

  const hasChanged =
    isGradeChanged ||
    isMajorChanged ||
    isClassSectionChanged ||
    isTeacherIdChanged;

  return { hasChanged, changedData };
}

export async function PATCH(req: Request) {
  try {
    validateManagementSession();

    const rawData = await req.json();

    const data = updateClassSchema.parse(rawData);

    const currentClass = await prisma.classroom.findUnique({
      where: {
        id: data.id,
      },
      select: {
        id: true,
        grade: true,
        major: true,
        section: true,
        homeroomTeacherId: true,
      },
    });

    if (!currentClass) {
      throw badRequest("Classroom not found");
    }

    const findDuplicate = await prisma.classroom.findUnique({
      where: {
        grade_major_section: {
          grade: data.classSchema.grade,
          major: data.classSchema.major,
          section: data.classSchema.section,
        },
      },
      select: {
        id: true,
      },
    });

    if (findDuplicate && findDuplicate.id !== data.id) {
      throw badRequest("A classroom with this config already exists");
    }

    const { hasChanged, changedData } = compareClassAtributes(
      currentClass,
      data,
    );

    if (!hasChanged) {
      return Response.json({ message: "No data was edited" }, { status: 200 });
    }

    await prisma.classroom.update({
      where: {
        id: data.id,
      },
      data: changedData,
    });

    return Response.json(
      { message: "data successfully updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(PATCH) /api/staff/class",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    validateManagementSession();

    const { searchParams } = new URL(req.url);

    const classIdParam = Number(searchParams.get("classId"));
    if (!classIdParam || isNaN(classIdParam))
      throw badRequest("Invalid Class ID");

    if (!classIdParam) {
      throw badRequest("Class ID is required");
    }

    await prisma.classroom.delete({
      where: {
        id: classIdParam,
      },
    });

    return Response.json(
      { message: `Classroom deleted successfully ` },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(DELETE) /api/staff/class",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
