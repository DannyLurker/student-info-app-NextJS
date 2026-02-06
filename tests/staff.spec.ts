import { test, expect } from "@playwright/test";

test.describe("Account Creation", () => {
  test("Create student account as staff (VICE_PRINCIPAL / PRINCIPAL)", async ({
    request,
  }) => {
    const randomNumberGenerator = Math.floor(100 + Math.random() * 1000);

    const randomName = `std${randomNumberGenerator}`;
    const randomEmail = `stdacc${randomNumberGenerator}@gmail.com`;

    console.log(randomName, randomEmail);

    const response = await request.post(
      "/api/auth/account/single/student-account",
      {
        data: {
          username: randomName,
          email: randomEmail,
          studentRole: "STUDENT",
          passwordSchema: {
            password: "123123123",
            confirmPassword: "123123123",
          },
          classSchema: {
            grade: "ELEVENTH",
            major: "SOFTWARE_ENGINEERING",
            classNumber: "none",
          },
        },
      },
    );

    expect(response.ok);
    const body = await response.json();

    console.log(
      "Create student account as staff (VICE_PRINCIPAL / PRINCIPAL): " + body,
    );
  });
});

test.describe("Subject CRUD", () => {
  test("Create subject", async ({ request }) => {
    const response = await request.post("api/staff/subject", {
      data: {
        subjectRecords: [
          {
            subjectNames: ["Web", "Mobile"],
            subjectConfig: {
              grade: ["ELEVENTH", "TWELFTH"],
              major: ["SOFTWARE_ENGINEERING"],
              subjectType: "MAJOR",
            },
          },
        ],
      },
    });

    expect(response.ok);

    const body = await response.json();
    console.log("Details: " + body.details);
  });

  test("Get subject", async ({ request }) => {
    const response = await request.get("api/staff/subject", {
      params: {
        page: "0",
        sortOrder: "asc",
      },
    });

    expect(response.ok);
    const body = await response.json();
    console.log("Get Subject: " + body.subjects);
  });

  test("Update subject", async ({ request }) => {
    await request.post("api/staff/subject", {
      data: {
        subjectRecords: [
          {
            subjectNames: ["Web", "Mobile"],
            subjectConfig: {
              grade: ["ELEVENTH", "TWELFTH"],
              major: ["SOFTWARE_ENGINEERING"],
              subjectType: "MAJOR",
            },
          },
        ],
      },
    });

    const response = await request.patch("api/staff/subject", {
      data: {
        subjectId: 1,
        subjectNames: "PAL",
        subjectConfig: {
          major: ["Accounting"],
          subjectType: "MAJOR",
        },
      },
    });

    expect(response.ok);

    const body = await response.json();
    console.log("Update subject: " + body);
  });

  test("Delete subject", async ({ request }) => {
    const response = await request.patch("api/staff/subject", {
      params: {
        subjectId: 1,
      },
    });

    expect(response.ok);

    const body = await response.json();
    console.log("Update subject: " + body);
  });
});
