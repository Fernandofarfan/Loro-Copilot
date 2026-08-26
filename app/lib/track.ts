// Wrapper seguro de Analytics (PostHog / Vercel Analytics / Dev logger)

export type FunnelEvent =
  | "page_view"
  | "session_started"
  | "session_ended"
  | "audio_source_selected"
  | "model_selected"
  | "answer_requested"
  | "answer_stream_started"
  | "answer_stream_completed"
  | "answer_feedback"
  | "teleprompter_opened"
  | "rescue_phrase_clicked"
  | "tts_played"
  | "simulator_started"
  | "simulator_turn_completed"
  | "simulator_feedback_generated";

let posthogClient: any = null;

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (posthogKey) {
    import("posthog-js").then((mod) => {
      try {
        mod.default.init(posthogKey, {
          api_host: posthogHost,
          autocapture: false,
          capture_pageview: false,
        });
        posthogClient = mod.default;
      } catch (err) {
        console.warn("No se pudo inicializar PostHog:", err);
      }
    }).catch(() => {});
  }
}

export function track(event: FunnelEvent | string, properties?: Record<string, any>) {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log(`📊 [Track] ${event}`, properties || {});
    }

    if (posthogClient) {
      posthogClient.capture(event, properties);
    }
  } catch (err) {
    // Fail-safe: las analíticas nunca deben romper la UI
  }
}

export function identify(distinctId: string, properties?: Record<string, any>) {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log(`👤 [Identify] ${distinctId}`, properties || {});
    }

    if (posthogClient) {
      posthogClient.identify(distinctId, properties);
    }
  } catch (err) {
    // Fail-safe
  }
}
