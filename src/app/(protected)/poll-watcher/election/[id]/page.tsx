import Heading from "@/components/heading";
import db from "@/lib/db";
import ElectionForm from "@/components/forms/election-form";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;
  const isCreate = params.id === "create";

  const [initialData, positionTemplates] = await Promise.all([
    isCreate
      ? null
      : db.election.findUnique({
          where: {
            id: params.id,
          },
          include: {
            positions: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        }),
    db.positionTemplate.findMany({
      where: {
        isActive: true,
      },
      include: {
        items: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    }),
  ]);

  if (!isCreate && !initialData) {
    return (
      <div>
        <Heading
          title="Election Not Found"
          description="The election you're looking for doesn't exist."
        />
      </div>
    );
  }

  const title = initialData
    ? `Edit Election: ${initialData.title}`
    : "Create new election";
  const description = initialData
    ? "Update the details of the election."
    : "Fill all the required fields to create a new election.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <ElectionForm
          initialData={initialData}
          positionTemplates={positionTemplates.map((template) => ({
            id: template.id,
            name: template.name,
            items: template.items.map((item) => ({
              title: item.title,
              winnerCount: item.winnerCount,
            })),
          }))}
        />
      </div>
    </div>
  );
};

export default Page;
