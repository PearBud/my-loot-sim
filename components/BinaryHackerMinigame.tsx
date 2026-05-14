"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type BinaryHackerMinigameProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

type AccessState = "active" | "granted";

const BIT_COUNT = 8;
const SUCCESS_DELAY_MS = 1000;

function createEmptyBits() {
  return Array<boolean>(BIT_COUNT).fill(false);
}

function bitsToDecimal(bits: boolean[]) {
  return bits.reduce((value, bit, index) => value + (bit ? 2 ** (BIT_COUNT - 1 - index) : 0), 0);
}

function createTargetValue() {
  return 1 + Math.floor(Math.random() * 255);
}

export function BinaryHackerMinigame({ onSuccess, onCancel }: BinaryHackerMinigameProps) {
  const [target] = useState(() => createTargetValue());
  const [bits, setBits] = useState(() => createEmptyBits());
  const [accessState, setAccessState] = useState<AccessState>("active");
  const successTimerRef = useRef<number | null>(null);

  const currentValue = useMemo(() => bitsToDecimal(bits), [bits]);
  const solved = currentValue === target;

  useEffect(
    () => () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    },
    [],
  );

  const flipBit = useCallback(
    (index: number) => {
      if (accessState === "granted") return;

      setBits((currentBits) => {
        const nextBits = currentBits.map((bit, bitIndex) => (bitIndex === index ? !bit : bit));
        if (bitsToDecimal(nextBits) === target) {
          setAccessState("granted");
          successTimerRef.current = window.setTimeout(() => {
            onSuccess();
          }, SUCCESS_DELAY_MS);
        }
        return nextBits;
      });
    },
    [accessState, onSuccess, target],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl overflow-hidden rounded-xl border border-emerald-400/25 bg-black/92 font-mono text-emerald-100 shadow-[0_0_100px_rgba(34,197,94,0.17)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="binary-hacker-title"
      >
        <div className="border-b border-emerald-900/70 bg-gradient-to-r from-black via-emerald-950/25 to-black px-5 py-4">
          <p className="text-xs uppercase tracking-[0.36em] text-emerald-400/75">Binary Payload Override</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="binary-hacker-title"
                className={`text-2xl font-bold tracking-wide transition-colors md:text-3xl ${
                  solved ? "text-emerald-300 drop-shadow-[0_0_14px_rgba(52,211,153,0.95)]" : "text-emerald-100"
                }`}
              >
                系统指令：目标值 {target}
              </h2>
              <p className="mt-1 text-sm text-emerald-700">翻转 8-bit 寄存器，使当前十进制读数匹配目标值。</p>
            </div>
            <div
              className={`rounded border bg-black px-3 py-2 text-right text-xs transition ${
                solved
                  ? "border-emerald-300 text-emerald-300 shadow-[0_0_26px_rgba(52,211,153,0.42)]"
                  : "border-emerald-900 text-emerald-600"
              }`}
            >
              <p>{solved ? "ROOT ACCESS GRANTED" : "AWAITING BYTE MATCH"}</p>
              <p>DEC::{currentValue.toString().padStart(3, "0")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5">
          <div className="relative overflow-hidden rounded-lg border border-emerald-500/20 bg-zinc-950 p-5 shadow-[inset_0_0_36px_rgba(21,128,61,0.16)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.07)_1px,transparent_1px)] bg-[length:100%_7px] opacity-75" />
            <div className="pointer-events-none absolute -inset-x-12 top-0 h-px animate-pulse bg-emerald-300/80 shadow-[0_0_24px_rgba(110,231,183,0.9)]" />

            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8" aria-label="8 位二进制寄存器">
              {bits.map((bit, index) => {
                const power = BIT_COUNT - 1 - index;
                const weight = 2 ** power;
                return (
                  <button
                    key={`bit-${power}`}
                    type="button"
                    onClick={() => flipBit(index)}
                    disabled={accessState === "granted"}
                    className={`group aspect-square border-2 p-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed ${
                      bit
                        ? "border-emerald-300 bg-emerald-500/18 text-emerald-200 shadow-[0_0_26px_rgba(34,197,94,0.35),inset_0_0_18px_rgba(34,197,94,0.14)]"
                        : "border-emerald-900 bg-black text-emerald-800 hover:border-emerald-500 hover:bg-emerald-950/30 hover:text-emerald-300"
                    }`}
                    aria-label={`翻转 2 的 ${power} 次方位，当前为 ${bit ? 1 : 0}`}
                  >
                    <span className="block text-4xl font-black leading-none md:text-5xl">{bit ? 1 : 0}</span>
                    <span className="mt-3 block text-[10px] text-emerald-600 transition group-hover:text-emerald-400">
                      2^{power}={weight}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-emerald-900/70 bg-black/60 p-4 text-sm text-emerald-600 md:grid-cols-3">
            <p>BIN::{bits.map((bit) => (bit ? 1 : 0)).join("")}</p>
            <p>DEC::{currentValue}</p>
            <p className={solved ? "text-emerald-300" : "text-emerald-700"}>TARGET::{target}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-900/70 pt-4">
            <p className="min-h-[1.25rem] text-xs text-emerald-700" aria-live="polite">
              {solved ? "字节载荷已对齐，正在写入保险箱访问令牌。" : "提示：左侧为高位，右侧为低位。"}
            </p>
            <button
              type="button"
              onClick={onCancel}
              disabled={accessState === "granted"}
              className="rounded-md border border-red-500/30 bg-red-950/20 px-4 py-2 text-sm text-red-200 transition hover:border-red-400/60 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300"
            >
              跳过破解
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
