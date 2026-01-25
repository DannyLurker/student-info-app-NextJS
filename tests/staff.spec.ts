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

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.message).toBe("Student account created successfully");
  });
});
