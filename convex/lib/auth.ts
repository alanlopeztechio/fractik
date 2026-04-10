import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

function extractOrgId(identity: Record<string, unknown>): string | undefined {
  const orgIdClaim = identity.slg;
  if (typeof orgIdClaim === "string" && orgIdClaim.length > 0) {
    return orgIdClaim;
  }

  const orgClaim = identity.o;
  if (orgClaim && typeof orgClaim === "object") {
    const orgObject = orgClaim as { id?: unknown };
    if (typeof orgObject.id === "string" && orgObject.id.length > 0) {
      return orgObject.id;
    }
  }

  return undefined;
}

export async function getAuthUser(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const orgId = extractOrgId(identity as unknown as Record<string, unknown>);
  if (!orgId) {
    throw new Error("No organization selected");
  }

  return {
    userId: identity.subject,
    orgId,
    name: identity.name ?? "Unknown",
    email: identity.email ?? "",
  };
}
