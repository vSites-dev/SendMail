import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { sendVerificationEmail } from "@/utils/send-emails";
import { getActiveOrganization } from "../get-active-organization";

export const auth = betterAuth({
  plugins: [organization()],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log("sendVerificationEmail triggered", user, url, token);

      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        verificationUrl: url,
      });
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organizationId = await getActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: organizationId,
            },
          };
        },
      },
    },
  },
});

export type Organization = typeof auth.$Infer.Organization;
