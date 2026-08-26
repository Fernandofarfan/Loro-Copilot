"use client";

import React, { useState, useEffect } from "react";
import { SparkleIcon, CheckIcon, CopyIcon } from "../components/Icons";

export type FeedbackQuestion = {
  question: string;
  answer: string;
  score?: number;
  analysis: string;
  suggestion: string;
};

export type FeedbackIndicator = { name: string; score: number };

export type FeedbackReport = {
  score: number;
  level?: string;
  verdict?: string;
  topPriority?: string;
  nextStep?: string;
  summary: string;
  indicators?: FeedbackIndicator[];
  strengths: string[];
  improvements: string[];
  questions: FeedbackQuestion[];
};

export function scoreColor(score: number): string {
  return score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
}

export function scoreInk(score: number): string {
  return score >= 75 ? "#047857" : score >= 50 ? "#b45309" : "#dc2626";
}

function polarPoint(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const a = polarPoint(cx, cy, r, fromDeg);
  const b = polarPoint(cx, cy, r, toDeg);
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export function ScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const [needle, setNeedle] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setNeedle(clamped), 150);
    return () => clearTimeout(t);
  }, [clamped]);

  const needleDeg = needle * 1.8 - 90;
  const R = 82;

  return (
    <div className="sim-gauge" role="img" aria-label={`Puntaje ${clamped} de 100`}>
      <svg viewBox="0 0 200 122" className="sim-gauge-svg">
        <path d={arcPath(100, 104, R, 180, 111)} stroke="#fecaca" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={arcPath(100, 104, R, 107, 57)} stroke="#fde68a" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={arcPath(100, 104, R, 53, 0)} stroke="#a7f3d0" strokeWidth="14" fill="none" strokeLinecap="round" />
        {[0, 25, 50, 75, 100].map((v) => {
          const a = polarPoint(100, 104, R - 14, 180 - v * 1.8);
          const b = polarPoint(100, 104, R - 20, 180 - v * 1.8);
          return <line key={v} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cbd5e1" strokeWidth="2" />;
        })}
        <g
          className="sim-gauge-needle"
          style={{
            transform: `rotate(${needleDeg}deg)`,
            transformOrigin: "100px 104px",
            transition: "transform 1.3s cubic-bezier(0.3, 1.3, 0.45, 1)",
          }}
        >
          <line x1="100" y1="104" x2="100" y2="36" stroke="#17181a" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="104" r="8" fill="#17181a" />
          <circle cx="100" cy="104" r="3" fill="#fff" />
        </g>
      </svg>
      <div className="sim-gauge-value" style={{ color: scoreInk(clamped) }}>
        {clamped}
        <span className="sim-gauge-total">/100</span>
      </div>
      <div className="sim-score-label">PUNTAJE GENERAL</div>
    </div>
  );
}

export function TrafficLight({ score }: { score: number }) {
  const level = score >= 75 ? 2 : score >= 50 ? 1 : 0;
  const colors = ["#ef4444", "#f59e0b", "#10b981"];
  return (
    <span className="sim-traffic" aria-hidden="true">
      {colors.map((c, i) => (
        <span
          key={c}
          className="sim-traffic-dot"
          style={i === level ? { background: c, boxShadow: `0 0 8px ${c}88` } : undefined}
        />
      ))}
    </span>
  );
}

interface FeedbackReportViewProps {
  feedbackReport: FeedbackReport | null;
  emailGatePassed: boolean;
  email: string;
  setEmail: (email: string) => void;
  emailError: string;
  setEmailError: (err: string) => void;
  emailSending: boolean;
  submitEmail: () => void;
  copiedIndex: number | null;
  copyOptimalAnswer: (index: number, text: string) => void;
  goToCopilot: () => void;
  shareSimulator: () => void;
  onRestart: () => void;
}

export function FeedbackReportView({
  feedbackReport,
  emailGatePassed,
  email,
  setEmail,
  emailError,
  setEmailError,
  emailSending,
  submitEmail,
  copiedIndex,
  copyOptimalAnswer,
  goToCopilot,
  shareSimulator,
  onRestart,
}: FeedbackReportViewProps) {
  return (
    <>
      {!emailGatePassed && (
        <div className="paywall-overlay">
          <div className="paywall">
            <div className="paywall-title">¡Simulación completada! 🦜</div>
            <p className="paywall-text">
              La IA terminó de analizar tu entrevista completa. Ingresá tu email para
              desbloquear tu puntaje y ver tus correcciones exactas en este momento:
            </p>
            <div className="paywall-form">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && submitEmail()}
                placeholder="tu@email.com"
                className="form-input"
              />
              <button
                className="btn-action btn-primary"
                onClick={submitEmail}
                disabled={!email.trim() || emailSending}
              >
                {emailSending ? "Enviando…" : "Ver mi Resultado Ahora"}
              </button>
              {emailError && <div className="paywall-error">{emailError}</div>}
            </div>
          </div>
        </div>
      )}

      <div className="sim-score-circle-wrapper">
        <ScoreGauge score={feedbackReport?.score ?? 0} />
        {(feedbackReport?.level || feedbackReport?.verdict) && (
          <div className="sim-verdict">
            {feedbackReport?.level && (
              <span
                className="sim-verdict-level"
                style={{
                  color: scoreInk(feedbackReport.score ?? 0),
                  borderColor: scoreColor(feedbackReport.score ?? 0),
                }}
              >
                Nivel: {feedbackReport.level}
              </span>
            )}
            {feedbackReport?.verdict && <p className="sim-verdict-text">{feedbackReport.verdict}</p>}
          </div>
        )}
      </div>

      {(feedbackReport?.topPriority || feedbackReport?.nextStep) && (
        <div className="sim-priority">
          <div className="sim-priority-label">👉 Enfocate en esto</div>
          {feedbackReport?.topPriority && (
            <p className="sim-priority-text">{feedbackReport.topPriority}</p>
          )}
          {feedbackReport?.nextStep && (
            <p className="sim-priority-step">
              <span>Próximo paso:</span> {feedbackReport.nextStep}
            </p>
          )}
        </div>
      )}

      {feedbackReport?.indicators && feedbackReport.indicators.length > 0 && (
        <div className="sim-indicators">
          {feedbackReport.indicators.map((ind, i) => {
            const s = Math.max(0, Math.min(100, Math.round(ind.score)));
            return (
              <div className="sim-ind-card" key={i}>
                <div className="sim-ind-top">
                  <span className="sim-ind-name">{ind.name}</span>
                  <TrafficLight score={s} />
                </div>
                <div className="sim-ind-score" style={{ color: scoreInk(s) }}>{s}</div>
                <div className="sim-ind-bar">
                  <div className="sim-ind-bar-fill" style={{ width: `${s}%`, background: scoreColor(s) }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="sim-card">
        <div className="sim-card-header">📊 Resumen del feedback</div>
        <div className="sim-card-body">
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)" }}>{feedbackReport?.summary}</p>
        </div>
      </div>

      <div className="sim-columns-layout">
        <div className="sim-feedback-card" style={{ borderColor: "#a7f3d0" }}>
          <div className="sim-feedback-card-title" style={{ color: "var(--loro-green-bright)" }}>
            👍 Fortalezas
          </div>
          <ul className="sim-strengths-list">
            {(feedbackReport?.strengths ?? []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="sim-feedback-card" style={{ borderColor: "#fde68a" }}>
          <div className="sim-feedback-card-title" style={{ color: "#d97706" }}>
            💡 Áreas de Mejora
          </div>
          <ul className="sim-improvements-list">
            {(feedbackReport?.improvements ?? []).map((imp, i) => (
              <li key={i}>{imp}</li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 12, color: "var(--loro-green-deep)" }}>
        ANÁLISIS PREGUNTA POR PREGUNTA
      </h3>

      <div>
        {(feedbackReport?.questions ?? []).map((q, i) => (
          <div key={i} className="sim-question-report-card">
            <div className="sim-report-q-header">
              <span>
                Pregunta {i + 1}: {q.question}
              </span>
              {typeof q.score === "number" && (
                <span
                  className="sim-qscore"
                  style={{ color: scoreInk(q.score), borderColor: scoreColor(q.score) }}
                >
                  {Math.round(q.score)}
                </span>
              )}
            </div>
            <div className="sim-report-row">
              <span className="sim-report-label">Tu Respuesta</span>
              <p className="sim-report-val" style={{ color: "var(--ink-dim)" }}>{q.answer}</p>
            </div>
            <div className="sim-report-row">
              <span className="sim-report-label">Análisis del asistente</span>
              <p className="sim-report-val">{q.analysis}</p>
            </div>
            <div className="sim-report-row">
              <span className="sim-report-label">Sugerencia del asistente (Cómo responder mejor)</span>
              <div className="sim-report-val-suggestion">
                <p>{q.suggestion}</p>
                <button
                  className="sim-copy-suggested-btn"
                  onClick={() => copyOptimalAnswer(i, q.suggestion)}
                  aria-label="Copiar sugerencia"
                  title="Copiar sugerencia"
                >
                  {copiedIndex === i ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sim-cross">
        <div className="sim-cross-eyebrow">Esto fue práctica. La entrevista real, no. 🦜</div>
        <div className="sim-cross-title">En la entrevista real, el asistente entra contigo.</div>
        <div className="sim-cross-text">
          Escucha la pregunta y te sopla la respuesta al instante —armada con tu CV, la empresa y el
          puesto—. Vos solo la leés. Nadie se entera.
        </div>
        <button onClick={goToCopilot} className="btn-action btn-primary btn-answer sim-cross-btn">
          <span className="btn-answer-inner flex items-center justify-center gap-2">
            <SparkleIcon />
            Activar Interview Copilot en tu entrevista →
          </span>
        </button>
        <button onClick={shareSimulator} className="btn-action btn-whatsapp">
          Compartíselo a alguien que tiene una entrevista pronto 🦜
        </button>
      </div>

      <button onClick={onRestart} className="sim-restart-link">
        🔄 Otra simulación
      </button>
    </>
  );
}

export default FeedbackReportView;
