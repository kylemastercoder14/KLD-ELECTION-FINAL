
import db from "@/lib/db";
import Heading from "@/components/heading";
import AccountForm from "@/components/forms/account-form";
import { getServerSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const user = session.user;

  const params = await props.params;

  const initialData = await db.user.findUnique({
    where: {
      id: params.id,
    },
  });

  const title = initialData
    ? `Edit Account: ${initialData.name}`
    : "Create new account";
  const description = initialData
    ? "Update the details of the account."
    : "Fill all the required fields to create a new account.";
  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <AccountForm currentUserRole={user.role} initialData={initialData} />
      </div>
    </div>
  );
};

export default Page;
