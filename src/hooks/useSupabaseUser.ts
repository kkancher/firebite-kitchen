"use client";

import { useSyncExternalStore } from "react";
import { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

let currentUser: User | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function ensureInitialized() {
  if (initialized) return;
  initialized = true;

  void supabaseBrowser.auth.getSession().then(({ data }) => {
    currentUser = data.session?.user ?? null;
    emit();
  });

  supabaseBrowser.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    emit();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureInitialized();
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureInitialized();
  return currentUser;
}

function getServerSnapshot() {
  return null;
}

export function useSupabaseUser() {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    user,
    isAuthenticated: Boolean(user),
  };
}
