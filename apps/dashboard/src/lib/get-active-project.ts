import { db } from "@/server/db";

const getActiveProject = async (organizationId: string) => {
  return await db.project.findUnique({
    where: {
      organizationId,
    },
  });
};

export default getActiveProject;
