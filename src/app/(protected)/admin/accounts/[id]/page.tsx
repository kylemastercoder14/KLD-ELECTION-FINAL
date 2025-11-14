import React from "react";
import db from "@/lib/db";
import Heading from "@/components/heading";
import AccountForm from "@/components/forms/account-form";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
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
        <AccountForm initialData={initialData} />
      </div>
    </div>
  );
};

export default Page;
