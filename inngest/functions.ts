import ExcelDownloadEmail from "@/emails/ExcelDownloadEmail";
import { inngest } from "./client";
import { getStudentExport } from "@/services/student/student-service";
import { put } from "@vercel/blob";
import { getFullClassLabel } from "@/lib/utils/labels";
import path from "path";
import fs from "fs/promises";
import { sendEmail } from "@/emails/nodeMailer";
import { render } from "@react-email/render";

export const generateStudentsExcel = inngest.createFunction(
  {
    id: "generate-students-excel",
    concurrency: { limit: 5 },
    triggers: { event: "app/students.export.requested" },
  },
  async ({ event, step }) => {
    const { payload, userEmail, userName } = event.data;

    const { studentBuffer } = await step.run("generate-excel", async () => {
      return await getStudentExport(payload);
    });

    // Upload to Vercel Blob
    // const downloadUrl = await step.run("upload-to-storage", async () => {
    //   const blob = await put(
    //     `exports/students-${payload.major}.xlsx`,
    //     studentBuffer,
    //     {
    //       access: "public",
    //     },
    //   );
    //   return blob.url;
    // });

    const downloadUrl = await step.run("save-locally", async () => {
      const fileName = `students-${payload.major}.xlsx`;
      // This path points to your Next.js /public folder
      const filePath = path.join(process.cwd(), "public", "exports", fileName);

      // Create folder if it doesn't exist
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write the file
      await fs.writeFile(filePath, studentBuffer);

      // Return the localhost URL
      return `http://localhost:3000/exports/${fileName}`;
    });

    const html = render(ExcelDownloadEmail({
      schoolName: "SMK ADVENT",
      teacherName: userName,
      classroom: getFullClassLabel(
        payload.major,
        payload.grade,
        payload.section,
      ),
      currentYear: new Date().getFullYear(),
      downloadUrl: downloadUrl,
    }));

    //Work on here
    await step.run("send-email", async () => {
      sendEmail({email: userEmail, html: html, subject: })
    });

    return { downloadUrl };
  },
);
