"use server";

import { revalidatePath } from "next/cache";

import { getServerBackend } from "@/services/backend/client";
import type { AuthContext } from "@/services/backend/types";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toResult<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  return fn()
    .then((data) => ({ ok: true as const, data }))
    .catch((error: unknown) => ({
      ok: false as const,
      error: error instanceof Error ? error.message : "Something went wrong",
    }));
}

export async function getAuthContextAction(): Promise<ActionResult<AuthContext | null>> {
  return toResult(() => getServerBackend().getAuthContext());
}

export async function signUpAction(
  email: string,
  password: string,
  displayName: string,
): Promise<ActionResult<AuthContext>> {
  return toResult(async () => {
    const ctx = await getServerBackend().signUp(email, password, displayName);
    revalidatePath("/dashboard");
    return ctx;
  });
}

export async function signInAction(
  email: string,
  password: string,
): Promise<ActionResult<AuthContext>> {
  return toResult(async () => {
    const ctx = await getServerBackend().signIn(email, password);
    revalidatePath("/dashboard");
    return ctx;
  });
}

export async function signOutAction(): Promise<ActionResult<void>> {
  return toResult(async () => {
    await getServerBackend().signOut();
    revalidatePath("/");
  });
}
