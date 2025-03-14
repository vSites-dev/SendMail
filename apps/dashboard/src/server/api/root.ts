import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { contactRouter } from "./routers/contacts";
import { projectRouter } from "./routers/projects";
import { domainRouter } from "./routers/domains";
import { templateRouter } from "./routers/templates";
import { campaignRouter } from "./routers/campaigns";
import { emailRouter } from "./routers/emails";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  contact: contactRouter,
  project: projectRouter,
  domain: domainRouter,
  template: templateRouter,
  campaign: campaignRouter,
  email: emailRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
