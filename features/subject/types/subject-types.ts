import { getSubjects } from "@/services/subject/subject-services";

export type GetSubjectResponse = Awaited<ReturnType<typeof getSubjects>>;
