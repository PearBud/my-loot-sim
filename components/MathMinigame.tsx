"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MATH_PROBLEMS } from "@/lib/loot-sim/math-problems";

type MathMinigameProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

type AccessState = "idle" | "checking" | "granted" | "denied";

type FractionProps = {
  numerator: ReactNode;
  denominator: ReactNode;
};

function Fraction({ numerator, denominator }: FractionProps) {
  return (
    <span className="inline-flex translate-y-1 flex-col items-center align-middle leading-none">
      <span className="border-b border-zinc-100 px-1 pb-1">{numerator}</span>
      <span className="px-1 pt-1">{denominator}</span>
    </span>
  );
}

function Limit({ variable, to }: { variable: string; to: ReactNode }) {
  return (
    <span className="mr-2 inline-flex flex-col items-center align-middle leading-none">
      <span className="text-2xl">lim</span>
      <span className="text-xs text-zinc-300">
        {variable} → {to}
      </span>
    </span>
  );
}

function Integral({ from, to }: { from: ReactNode; to: ReactNode }) {
  return (
    <span className="relative mx-1 inline-block h-12 w-7 align-middle">
      <span className="absolute left-3 top-0 text-xs text-zinc-300">{to}</span>
      <span className="absolute left-1 top-2 text-4xl leading-none">∫</span>
      <span className="absolute bottom-0 left-3 text-xs text-zinc-300">{from}</span>
    </span>
  );
}

function renderProblemExpression(problemIndex: number) {
  switch (problemIndex) {
    case 0:
      return (
        <>
          <Limit variable="x" to="0" />
          <Fraction numerator={<>sin(7x)</>} denominator={<>sin x</>} />
        </>
      );
    case 1:
      return (
        <>
          <Limit variable="x" to="0" />
          <Fraction numerator={<>e<sup>5x</sup> − 1</>} denominator="x" />
        </>
      );
    case 2:
      return (
        <>
          <Limit variable="x" to="∞" />x(√<span className="overline">x² + 6x</span> − x) · <Fraction numerator="1" denominator="x" />
        </>
      );
    case 3:
      return (
        <>
          <Integral from="0" to="3" /> 2x dx
        </>
      );
    case 4:
      return (
        <>
          <Integral from="0" to="2" /> (3x² + 2x) dx
        </>
      );
    case 5:
      return (
        <>
          <Integral from="0" to="π" /> sin x dx
        </>
      );
    case 6:
      return (
        <>
          <Integral from="0" to="1" />
          <Integral from="0" to="2" /> 3xy dy dx
        </>
      );
    case 7:
      return (
        <>
          <Integral from="0" to="2" />
          <Integral from="0" to="1" /> (x + y) dy dx
        </>
      );
    case 8:
      return (
        <>
          <Integral from="0" to="1" /> 12x² dx
        </>
      );
    case 9:
      return (
        <>
          <Limit variable="n" to="∞" />n(√<span className="overline">n² + 8n</span> − n) · <Fraction numerator="1" denominator="n" />
        </>
      );
    case 10:
      return (
        <>
          <Limit variable="x" to="0" />
          <Fraction numerator={<>sin(12x)</>} denominator={<>sin(4x)</>} />
        </>
      );
    case 11:
      return (
        <>
          <Limit variable="x" to="0" />
          <Fraction numerator={<>e<sup>6x</sup> − 1</>} denominator="2x" />
        </>
      );
    case 12:
      return (
        <>
          <Limit variable="x" to="0" />
          <Fraction numerator="ln(1 + 8x)" denominator="x" />
        </>
      );
    case 13:
      return (
        <>
          <Integral from="0" to="4" /> x dx
        </>
      );
    case 14:
      return (
        <>
          <Integral from="0" to="3" /> (2x + 1) dx
        </>
      );
    case 15:
      return (
        <>
          <Integral from="0" to="1" /> 20x³ dx
        </>
      );
    case 16:
      return (
        <>
          <Integral from="0" to="π/2" /> 6sin x dx
        </>
      );
    case 17:
      return (
        <>
          <Integral from="0" to="2" />
          <Integral from="0" to="2" /> xy dy dx
        </>
      );
    case 18:
      return (
        <>
          <Limit variable="n" to="∞" />n(√<span className="overline">n² + 10n</span> − n) · <Fraction numerator="1" denominator="n" />
        </>
      );
    case 19:
      return (
        <>
          <Integral from="1" to="3" /> 3x² dx
        </>
      );
    case 20:
      return (
        <>
          <Integral from="0" to="1" />
          <Integral from="0" to="x" /> 24xy dy dx
        </>
      );
    case 21:
      return (
        <>
          <Integral from="0" to="2" />
          <Integral from="0" to="y" /> 6x dx dy
        </>
      );
    case 22:
      return (
        <>
          <Limit variable="x" to="0" />
          <Fraction numerator="1 − cos(4x)" denominator="x²" />
        </>
      );
    case 23:
      return (
        <>
          <Limit variable="x" to="0" />
          <Fraction numerator="sin(5x) − sin(3x)" denominator="x" />
        </>
      );
    case 24:
      return (
        <>
          <Integral from="0" to="1" /> (30x⁴ − 12x²) dx
        </>
      );
    case 25:
      return (
        <>
          <Integral from="0" to="2" /> (x + 1)³ dx
        </>
      );
    case 26:
      return (
        <>
          <Integral from="0" to="π/2" /> 8sin x cos x dx
        </>
      );
    case 27:
      return (
        <>
          <Limit variable="n" to="∞" />n(ln(n + 7) − ln n)
        </>
      );
    case 28:
      return (
        <>
          <Integral from="0" to="1" />
          <Integral from="0" to="1" />
          <Integral from="0" to="1" /> 64xyz dz dy dx
        </>
      );
    case 29:
      return (
        <>
          <Integral from="−2" to="2" /> (3x² + 2) dx
        </>
      );
    default:
      return "题目加载中";
  }
}

function pickProblem() {
  const index = Math.floor(Math.random() * MATH_PROBLEMS.length);
  return { index, ...MATH_PROBLEMS[index] };
}

export function MathMinigame({ onSuccess, onCancel }: MathMinigameProps) {
  const [problem] = useState(() => pickProblem());
  const [answer, setAnswer] = useState("");
  const [accessState, setAccessState] = useState<AccessState>("idle");
  const successTimerRef = useRef<number | null>(null);

  const parsedAnswer = useMemo(() => Number(answer.trim()), [answer]);
  const canSubmit = answer.trim().length > 0 && accessState !== "checking" && accessState !== "granted";

  useEffect(
    () => () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    },
    [],
  );

  const submitAnswer = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) return;

      setAccessState("checking");
      window.setTimeout(() => {
        if (Number.isInteger(parsedAnswer) && parsedAnswer === problem.answer) {
          setAccessState("granted");
          successTimerRef.current = window.setTimeout(() => {
            onSuccess();
          }, 550);
          return;
        }

        setAccessState("denied");
      }, 220);
    },
    [canSubmit, onSuccess, parsedAnswer, problem.answer],
  );

  const statusText =
    accessState === "granted"
      ? "ACCESS GRANTED"
      : accessState === "denied"
        ? "ACCESS DENIED"
        : accessState === "checking"
          ? "VERIFYING HASH"
          : "AWAITING INPUT";

  const statusClass =
    accessState === "granted"
      ? "border-emerald-400/70 text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.28)]"
      : accessState === "denied"
        ? "border-red-400/70 text-red-300 shadow-[0_0_28px_rgba(248,113,113,0.22)]"
        : "border-zinc-700 text-zinc-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-cyan-400/20 bg-zinc-950/90 text-zinc-100 shadow-[0_0_90px_rgba(34,211,238,0.14)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="math-minigame-title"
      >
        <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-cyan-950/30 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.34em] text-cyan-300/80">Mathematical Logic Breach</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="math-minigame-title" className="text-2xl font-semibold tracking-wide text-zinc-50">
                数学逻辑破解
              </h2>
              <p className="mt-1 text-sm text-zinc-500">解出核心校验值，获得本局保险箱搜索权限。</p>
            </div>
            <div className={`rounded border bg-black/35 px-3 py-2 text-right font-mono text-xs transition ${statusClass}`}>
              <p>{statusText}</p>
              <p className="text-[10px] text-zinc-500">LOGIC_CORE::V2</p>
            </div>
          </div>
        </div>

        <form onSubmit={submitAnswer} className="space-y-5 p-5">
          <div className="relative overflow-hidden rounded-lg border border-cyan-400/20 bg-black/55 p-6 shadow-[inset_0_0_32px_rgba(8,145,178,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[length:100%_6px] opacity-60" />
            <div className="pointer-events-none absolute -inset-x-10 top-0 h-px animate-pulse bg-cyan-300/70 shadow-[0_0_22px_rgba(103,232,249,0.9)]" />
            <p className="relative mb-4 text-center font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/70">
              Evaluate Integer Payload
            </p>
            <div className="relative rounded-md border border-zinc-800 bg-zinc-950/80 px-4 py-8 text-center">
              <div className="flex min-h-24 items-center justify-center font-serif text-2xl text-zinc-100 md:text-3xl">
                {renderProblemExpression(problem.index)}
              </div>
            </div>
          </div>

          <label className="block rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
            <span className="mb-3 block text-sm font-medium text-zinc-300">整数答案</span>
            <input
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                if (accessState === "denied") setAccessState("idle");
              }}
              className={`w-full rounded-md border bg-black px-4 py-3 font-mono text-lg tracking-[0.28em] text-cyan-200 caret-cyan-300 outline-none transition placeholder:text-zinc-700 focus:border-cyan-300 focus:shadow-[0_0_28px_rgba(34,211,238,0.28)] ${
                accessState === "denied"
                  ? "border-red-400/70 shadow-[0_0_24px_rgba(248,113,113,0.18)]"
                  : accessState === "granted"
                    ? "border-emerald-400/70 shadow-[0_0_24px_rgba(52,211,153,0.24)]"
                    : "border-zinc-700"
              }`}
              placeholder="ENTER VALUE"
              autoComplete="off"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
            <p className="min-h-[1.25rem] font-mono text-xs text-zinc-500" aria-live="polite">
              {accessState === "denied" ? "校验失败：答案不匹配，重新输入整数密钥。" : "题目结果保证为整数。"}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-red-500/30 bg-red-950/20 px-4 py-2 text-sm text-red-200 transition hover:border-red-400/60 hover:bg-red-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300"
              >
                跳过破解
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-md border border-cyan-400/40 bg-cyan-950/30 px-5 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-900/40 hover:shadow-[0_0_24px_rgba(34,211,238,0.2)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
              >
                提交
              </button>
            </div>
          </div>
        </form>
      </motion.section>
    </div>
  );
}
