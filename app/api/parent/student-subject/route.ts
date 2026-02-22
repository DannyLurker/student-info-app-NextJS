import { prisma } from "@/db/prisma";
import { handleError, notFound } from "@/lib/errors";
import { validateParentSession } from "@/lib/validation/guards";

export async function GET() {
    try {
        const parentSession = await validateParentSession();

        const subjects = await prisma.subject.findMany({
            where: {
                config: {
                    allowedGrades: {
                        has: parentSession.student.class?.grade,
                    },
                    allowedMajors: {
                        has: parentSession.student.class?.major,
                    },
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (subjects.length === 0) throw notFound("Subject data not found");

        return Response.json(
            { message: "Successfully retrieved subject data", subjects },
            { status: 200 },
        );
    } catch (error) {
        console.error("API_ERROR", {
            route: "(GET) /api/parent/student-subject",
            message: error instanceof Error ? error.message : String(error),
        });
        return handleError(error);
    }
}
