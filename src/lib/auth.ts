import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import db from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false, // We'll use username plugin instead
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: ["email", "profile"],
    },
  },
  plugins: [username()],
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Check email domain before user creation
          const email = user.email?.toLowerCase() ?? "";

          if (!email.endsWith("@kld.edu.ph")) {
            throw new APIError("BAD_REQUEST", {
              message: "Only @kld.edu.ph email addresses are allowed.",
            });
          }
        },
      },
    },
  },
});
