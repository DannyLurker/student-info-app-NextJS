import { Grade, Major } from "@/lib/constants/class";
import { SubjectType } from "@/lib/constants/subject";
import { CreateSubjectInput } from "@/lib/utils/zodSchema";
import React, { ChangeEvent, useState } from "react";

type ConfigType = "MAJOR" | "GRADE";

const SubjectCreateForm = () => {
  const [subjectData, setSubjectData] = useState<CreateSubjectInput>({
    subjectRecords: [],
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
            return {
              ...subject,
              subjectConfig: {
                major:
                  configType === "MAJOR"
                    ? ([...subject.subjectConfig.major, ""] as Major[])
                    : ([...subject.subjectConfig.major] as Major[]),
                grade:
                  configType === "GRADE"
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

  return <div></div>;
};

export default SubjectCreateForm;
