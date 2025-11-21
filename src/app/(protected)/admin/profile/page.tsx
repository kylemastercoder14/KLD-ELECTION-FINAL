import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import ProfileClient from "@/components/profile-client";

const Page = async () => {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const profile = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
      sessions: true,
      logs: true
    }
  });

  if (!profile) redirect("/auth/sign-in");

  return (
    <div>
      <ProfileClient profile={profile} />
    </div>
  );
};

export default Page;
