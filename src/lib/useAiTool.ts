"use client";

import { useCallback, useState } from "react";
import { getRecaptchaToken } from "./recaptcha-client";

interface AiState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

/**
 * Shared client hook for every AI tool. Fetches a reCAPTCHA token, posts the
 * form fields to /api/ai with the tool's action, and returns the result.
 */
export function useAiTool<T>(action: string) {
  const [state, setState] = useState<AiState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  const submit = useCallback(
    async (fields: Record<string, unknown>): Promise<T | null> => {
      setState({ loading: true, error: null, data: null });
      try {
        const recaptchaToken = await getRecaptchaToken(action);
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, data: fields, recaptchaToken }),
        });
        const json = (await res.json()) as
          | { success: true; data: T }
          | { success: false; error: string };
        if (!json.success) {
          setState({ loading: false, error: json.error, data: null });
          return null;
        }
        setState({ loading: false, error: null, data: json.data });
        return json.data;
      } catch {
        setState({
          loading: false,
          error: "Network error. Please check your connection and try again.",
          data: null,
        });
        return null;
      }
    },
    [action]
  );

  const reset = useCallback(
    () => setState({ loading: false, error: null, data: null }),
    []
  );

  return { ...state, submit, reset };
}
