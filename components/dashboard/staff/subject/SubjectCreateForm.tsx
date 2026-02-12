import { Grade, GRADES, Major } from "@/lib/constants/class";
import { SubjectType } from "@/lib/constants/subject";
import { CreateSubjectInput } from "@/lib/utils/zodSchema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { ChangeEvent, useState } from "react";

type ConfigType = "MAJOR" | "GRADE";

const grades = ["TENTH", "ELEVENTH", "TWELFTH"] as Grade[];
const majors = ["SOFTWARE_ENGINEERING", "ACCOUNTING"] as Major[];
const subjectTypes = ["GENERAL", "MAJOR"] as SubjectType[];

const SubjectCreateForm = () => {
  //  State management
  const [subjectData, setSubjectData] = useState<CreateSubjectInput>({
    subjectRecords: [],
  });
  const [errorMessage, setErrorMessage] = useState("");

  /* 
    TODO:
    1. create onSucess, onError and loading UI
    2. Refactor code
  */

  const mutation = useMutation({
    mutationFn: () => {
      return axios.post("/api/staff/subject", subjectData);
    },
  });

  const addSubjectSet = () => {
    const newSubjectRecord = {
      subjectNames: [""],
      subjectConfig: {
        grade: [],
        major: [],
        subjectType: "MAJOR" as SubjectType,
      },
    };

    setSubjectData((prev) => {
      // If prev is undefined, we create the initial object
      if (!prev) {
        return { subjectRecords: [newSubjectRecord] };
      }

      return {
        ...prev,
        subjectRecords: [...prev.subjectRecords, newSubjectRecord],
      };
    });
  };

  const addExtraSubjectName = (subjectSetIndex: number) => {
    setSubjectData((prev) => {
      if (!prev) return prev;

      const updatedSubjectRecords = prev.subjectRecords.map(
        (subject, index) => {
          if (index === subjectSetIndex) {
            return {
              ...subject,
              subjectNames: [...subject.subjectNames, ""],
            };
          }
          return subject;
        },
      );

      return {
        ...prev,
        subjectRecords: updatedSubjectRecords,
      };
    });
  };

  const addExtraSubjectConfig = (
    subjectSetIndex: number,
    configType: ConfigType,
  ) => {
    setSubjectData((prev) => {
      if (!prev) return prev;

      const updatedSubjectRecords = prev.subjectRecords.map(
        (subject, index) => {
          if (index === subjectSetIndex) {
            const majorLimitReached =
              configType === "MAJOR" && subject.subjectConfig.major.length < 3;

            const gradeLimitReached =
              configType === "GRADE" && subject.subjectConfig.grade.length < 4;

            return {
              ...subject,
              subjectConfig: {
                major: majorLimitReached
                  ? ([...subject.subjectConfig.major, ""] as Major[])
                  : ([...subject.subjectConfig.major] as Major[]),
                grade: gradeLimitReached
                  ? ([...subject.subjectConfig.grade, ""] as Grade[])
                  : ([...subject.subjectConfig.grade] as Grade[]),
                subjectType: subject.subjectConfig.subjectType as SubjectType,
              },
            };
          }
          return subject;
        },
      );

      return {
        ...prev,
        subjectRecords: updatedSubjectRecords,
      };
    });
  };

  const handleSubjectNameChange = (
    e: ChangeEvent<HTMLInputElement>,
    subjectSetIndex: number,
    subjectNameIndex: number,
  ) => {
    setSubjectData((prev) => {
      const updatedSubjectRecords = prev.subjectRecords.map(
        (subject, index) => {
          if (index === subjectSetIndex) {
            return {
              ...subject,
              subjectNames: subject.subjectNames.map((name, nameIndex) => {
                if (subjectNameIndex === nameIndex) {
                  name = e.target.value;
                }
                return name;
              }),
            };
          }

          return subject;
        },
      );

      return {
        ...prev,
        subjectRecords: updatedSubjectRecords,
      };
    });
  };

  const handleSubjectConfigChange = (
    e: ChangeEvent<HTMLInputElement>,
    subjectSetIndex: number,
    configType: ConfigType,
    subjectConfigIndex: number,
  ) => {
    setSubjectData((prev) => {
      const updatedSubjectRecords = prev.subjectRecords.map(
        (subject, index) => {
          if (index === subjectSetIndex) {
            if (configType == "GRADE") {
              return {
                ...subject,
                subjectConfig: {
                  major: [...subject.subjectConfig.major] as Major[],
                  grade: subject.subjectConfig.grade.map((grade, index) => {
                    if (subjectConfigIndex === index) {
                      grade = e.target.value as Grade;
                    }
                    return grade;
                  }),
                  subjectType: subject.subjectConfig.subjectType,
                },
              };
            }

            if (configType == "MAJOR") {
              return {
                ...subject,
                subjectConfig: {
                  grade: [...subject.subjectConfig.grade] as Grade[],
                  major: subject.subjectConfig.major.map((major, index) => {
                    if (subjectConfigIndex === index) {
                      major = e.target.value as Major;
                    }
                    return major;
                  }),
                  subjectType: subject.subjectConfig.subjectType,
                },
              };
            }
          }

          return subject;
        },
      );

      return {
        ...prev,
        subjectRecords: updatedSubjectRecords,
      };
    });
  };

  const deleteSubjectSet = (subjectSetIndex: number) => {
    setSubjectData((prev) => {
      if (!prev) return prev;

      const filteredSubjectSet = subjectData.subjectRecords.filter(
        (_, index) => {
          return subjectSetIndex !== index;
        },
      );

      return {
        ...prev,
        filteredSubjectSet,
      };
    });
  };

  const deleteSubjectConfig = (
    subjectSetIndex: number,
    configType: ConfigType,
    subjectConfigIndex: number,
  ) => {
    setSubjectData((prev) => {
      const updatedSubjectData = subjectData.subjectRecords.map(
        (subject, index) => {
          if (index === subjectSetIndex) {
            if (configType == "GRADE") {
              return {
                ...subject,
                subjectConfig: subject.subjectConfig.grade.filter(
                  (_, gradeIndex) => subjectConfigIndex !== gradeIndex,
                ),
              };
            }

            if (configType == "MAJOR") {
              return {
                ...subject,
                subjectConfig: subject.subjectConfig.major.filter(
                  (_, majorIndex) => subjectConfigIndex !== majorIndex,
                ),
              };
            }
          }

          return subject;
        },
      );

      return {
        ...prev,
        updatedSubjectData,
      };
    });
  };

  const deleteSubjectName = (
    subjectSetIndex: number,
    subjectNameIndex: number,
  ) => {
    setSubjectData((prev) => {
      if (!prev) return prev;
      /* 
        1. Find the correct subjectRecords based on comparing with index
        2. Filter the selected subject name index
      */
      const updatedSubject = subjectData.subjectRecords
        .find((_, index) => {
          return subjectSetIndex === index;
        })
        ?.subjectNames.filter((_, index) => index !== subjectNameIndex);

      return {
        ...prev,
        updatedSubject,
      };
    });
  };

  const handleSubmit = () => {
    // Frontend validation, All fields must be filled
    subjectData.subjectRecords.map((subject, index) => {
      if (subject.subjectNames.length === 0) {
        setErrorMessage(
          `Subject set ${index + 1}: Subject name must be filled`,
        );
        return;
      }

      Object.entries(subject.subjectConfig).map(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length === 0) {
            setErrorMessage(
              `Subject set ${index + 1} at ${key}: All config must be filled`,
            );
            return;
          }
          return;
        }

        if (value.length !== 0 && value !== null) {
          setErrorMessage(
            `Subject set ${index + 1} at ${key}: Subject type must be filled`,
          );
          return;
        }
      });
    });

    mutation.mutate();
  };

  return <div></div>;
};

export default SubjectCreateForm;
