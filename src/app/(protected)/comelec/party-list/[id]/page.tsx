import db from "@/lib/db";
import Heading from "@/components/heading";
import PartylistForm from '@/components/forms/party-list-form';

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;
  const initialData = await db.party.findUnique({
    where: {
      id: params.id,
    },
  });

  const title = initialData
    ? `Edit Party List: ${initialData.name}`
    : "Create new party list";
  const description = initialData
    ? "Update the details of the party list."
    : "Fill all the required fields to create a new party list.";
  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <PartylistForm initialData={initialData} />
      </div>
    </div>
  );
};

export default Page;
