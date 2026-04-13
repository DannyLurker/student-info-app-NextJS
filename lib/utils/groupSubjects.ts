type GroupedSubjects = Record<string, any[]>;

export const groupSubjects = (subjects: any[]): GroupedSubjects => {
  const grouped: GroupedSubjects = {
    general: [],
    accounting: [],
    software_engineering: [],
  };

  subjects.forEach((subject) => {
    if (subject.subjectConfig.type === "GENERAL") {
      grouped.general.push(subject);
    } else if (
      subject.subjectConfig.type === "MAJOR" &&
      subject.subjectConfig.allowedMajors.includes("ACCOUNTING")
    ) {
      grouped.accounting.push(subject);
    } else if (
      subject.subjectConfig.type === "MAJOR" &&
      subject.subjectConfig.allowedMajors.includes("SOFTWARE_ENGINEERING")
    ) {
      grouped.software_engineering.push(subject);
    }
  });

  return grouped;
};
