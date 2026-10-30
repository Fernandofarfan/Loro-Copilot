"use client";

import type { Provider } from "../lib/llm";
import { OpenAIMark, AnthropicMark, GoogleMark } from "./Icons";

export type { Provider };

export type { ModelOption } from "../lib/llm";
export { MODELS, DEFAULT_MODEL_ID } from "../lib/llm";



export function OpenCodeMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

export function ProviderIcon({ provider }: { provider: Provider }) {
  return (
    <span className="dd-icon">
      {provider === "openai" ? <OpenAIMark /> : provider === "anthropic" ? <AnthropicMark /> : provider === "opencode" || provider === "openrouter" ? <OpenCodeMark /> : <GoogleMark />}
    </span>
  );
}
