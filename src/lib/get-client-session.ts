import { authClient } from "./auth-client";
import { use } from "react";

export function useClientSession() {
  const { data: session, isPending } = authClient.useSession();

  // If we need to fetch additional user data, we can do it here
  // For now, Better Auth's session should include basic user info
  // We might need to extend it with custom fields via Better Auth's configuration

  return {
    data: session,
    status: isPending ? "loading" : session ? "authenticated" : "unauthenticated",
    isPending,
  };
}

