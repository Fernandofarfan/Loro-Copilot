/**
 * speechCoach.ts — Analiza la cadencia, ritmo (WPM), balance de habla y muletillas del candidato.
 */

export interface SpeechMetrics {
  totalWordsCandidate: number;
  totalWordsInterviewer: number;
  talkToListenRatio: number; // Porcentaje de tiempo que habló el candidato (ej. 55%)
  wpm: number; // Palabras por minuto estimadas
  fillerWordsCount: number;
  fillerWordsBreakdown: Record<string, number>;
  pacingFeedback: string;
  ratioFeedback: string;
}

const COMMON_FILLERS = [
  // Español
  "eh", "ehh", "este", "o sea", "tipo", "nada", "viste", "bueno", "digamos",
  // Inglés
  "um", "uh", "you know", "like", "basically", "actually", "sort of", "kind of", "i mean"
];

export function analyzeSpeech(
  lines: Array<{ text: string; speaker: number }>,
  durationMinutes = 1
): SpeechMetrics {
  let candidateWords = 0;
  let interviewerWords = 0;
  const fillerCounts: Record<string, number> = {};

  for (const line of lines) {
    const rawWords = line.text.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = rawWords.length;

    if (line.speaker === 1) {
      candidateWords += wordCount;

      // Buscar muletillas en el texto del candidato
      const lowerText = line.text.toLowerCase();
      for (const filler of COMMON_FILLERS) {
        const regex = new RegExp(`\\b${filler}\\b`, "gi");
        const matches = lowerText.match(regex);
        if (matches && matches.length > 0) {
          fillerCounts[filler] = (fillerCounts[filler] || 0) + matches.length;
        }
      }
    } else {
      interviewerWords += wordCount;
    }
  }

  const totalWords = candidateWords + interviewerWords;
  const ratio = totalWords > 0 ? Math.round((candidateWords / totalWords) * 100) : 50;
  const effectiveMinutes = Math.max(0.5, durationMinutes);
  const wpm = Math.round(candidateWords / effectiveMinutes);

  const totalFillers = Object.values(fillerCounts).reduce((acc, c) => acc + c, 0);

  let pacingFeedback = "Ritmo óptimo y natural (120-150 WPM).";
  if (wpm > 165) {
    pacingFeedback = "Estás hablando muy rápido (>165 WPM). Hacé pausas tácticas de 1 segundo para proyectar calma y autoridad.";
  } else if (wpm < 100 && candidateWords > 20) {
    pacingFeedback = "Ritmo pausado (<100 WPM). Podés darle un poco más de dinamismo a tus respuestas técnicas.";
  }

  let ratioFeedback = "Balance ideal de conversación (40-60%).";
  if (ratio > 75) {
    ratioFeedback = "Monopolizaste gran parte de la llamada (>75%). Acortá tus anécdotas y chequeá sintonía con el entrevistador.";
  } else if (ratio < 30 && totalWords > 50) {
    ratioFeedback = "Participación baja (<30%). Elaborá más tus respuestas técnicas con la mecánica interna de tus proyectos.";
  }

  return {
    totalWordsCandidate: candidateWords,
    totalWordsInterviewer: interviewerWords,
    talkToListenRatio: ratio,
    wpm,
    fillerWordsCount: totalFillers,
    fillerWordsBreakdown: fillerCounts,
    pacingFeedback,
    ratioFeedback,
  };
}
