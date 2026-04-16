import LandingPage from "@/components/landing-page/LandingPage";
import { auth } from "@/lib/auth/authNode";

const page = async () => {
  const session = await auth();

  return <LandingPage session={session?.user} />;
};

export default page;
