import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const adminRouter = createTRPCRouter({
  checkEmailExists: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          email: input.email,
        },
      });

      return !!user;
    }),
});
