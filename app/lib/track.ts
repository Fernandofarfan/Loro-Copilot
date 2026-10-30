import type PostHogJs from "posthog-js";

// Eventos reales emitidos en el código (23). Agregar acá antes de usar un nombre nuevo:
// el union es la única validación que tiene la analítica.
export type FunnelEvent =
  | "answer_copied"
  | "answer_feedback"
  | "deepgram_connected"
  | "earbud_whisper_played"
  | "hub_copilot_click"
  | "hub_practice_click"
  | "screen_vision_captured"
  | "session_error"
  | "session_stopped"
  | "sim_answer_closed"
  | "sim_avatar_video_fallback"
  | "sim_camera_denied"
  | "sim_camera_toggled"
  | "sim_cross_sell_click"
  | "sim_email_submit"
  | "sim_feedback_shown"
  | "sim_interview_outcome"
  | "sim_mic_toggled"
  | "sim_question_asked"
  | "sim_session_finished"
  | "sim_session_start"
  | "sim_share_whatsapp"
  | "sim_tts_error";

let posthogClient: typeof PostHogJs | null = null;

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

export function track(event: FunnelEvent, properties?: Record<string, unknown>) {
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

export function identify(distinctId: string, properties?: Record<string, unknown>) {
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
