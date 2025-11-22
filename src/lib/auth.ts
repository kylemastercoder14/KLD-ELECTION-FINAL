import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import db from "./db";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",

  cookies: {
    sessionToken: {
      name: "better-auth.session",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // must be true in prod (HTTPS)
        sameSite: "lax",
        path: "/",
        domain:
          process.env.NODE_ENV === "production" ? ".votenyo.com" : undefined, // allow subdomains
      },
    },
  },

  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: false, // we use username plugin instead
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: ["email", "profile"],
    },
  },

  plugins: [username()],

  trustedOrigins: [
    "http://localhost:3000",
    "https://votenyo.com",
    "https://www.votenyo.com",
  ],

  user: {
    additionalFields: {
      role: { type: "string", required: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
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
