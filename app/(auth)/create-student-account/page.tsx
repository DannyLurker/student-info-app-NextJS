import CreateStudentAccount from "@/components/auth/CreateStudentAccount";

const Page = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bannerImg bg-cover bg-bottom">
      <div className="w-full max-w-md bg-blackOverlay rounded-lg">
        <CreateStudentAccount />
      </div>
    </div>
  );
};

export default Page;
