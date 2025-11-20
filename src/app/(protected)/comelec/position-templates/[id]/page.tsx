import React from "react";
import db from "@/lib/db";
import Heading from "@/components/heading";
import PositionTemplateForm from "@/components/forms/position-template-form";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;
  const isCreate = params.id === "create";

  const initialData = isCreate
    ? null
    : await db.positionTemplate.findUnique({
        where: {
          id: params.id,
        },
        include: {
          items: {
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
      });

  if (!isCreate && !initialData) {
    return (
      <div>
        <Heading
          title="Template Not Found"
          description="The position template you're looking for doesn't exist."
        />
      </div>
    );
  }

  const title = initialData
    ? `Edit Template: ${initialData.name}`
    : "Create new position template";
  const description = initialData
    ? "Update the details of the position template."
    : "Fill all the required fields to create a new position template.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <PositionTemplateForm initialData={initialData} />
      </div>
    </div>
  );
};

export default Page;


