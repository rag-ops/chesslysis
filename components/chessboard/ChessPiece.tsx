"use client";

import React from "react";

type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

const labels: Record<PieceType, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

// Chesslysis piece set. Original geometry built from a shared base/collar
// system so all six pieces read as one matched family at any board size.
// Palette matches the brand sheet exactly: cream for White, charcoal for Black.
const WHITE_FILL = "#EDE7DB";
const WHITE_STROKE = "#3D372C";
const BLACK_FILL = "#1F1F1F";
const BLACK_STROKE = "#8A8272";

/** Every piece sits on this flared plinth so the set reads as one family. */
const BASE_PATH = "M11 63h42l-3-7H14z";

export default function ChessPiece({ color, type }: { color: "w" | "b"; type: PieceType }) {
  const fill = color === "w" ? WHITE_FILL : BLACK_FILL;
  const stroke = color === "w" ? WHITE_STROKE : BLACK_STROKE;
  const common = { fill, stroke, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  return (
    <svg
      viewBox="0 0 64 64"
      className="h-[80%] w-[80%] drop-shadow-[0_2px_1.5px_rgba(0,0,0,.25)]"
      role="img"
      aria-label={`${color === "w" ? "white" : "black"} ${labels[type]}`}
    >
      <path d={BASE_PATH} {...common} />

      {type === "p" && (
        <g {...common}>
          <path d="M22 52 L27 34 L37 34 L42 52 Z" />
          <ellipse cx="32" cy="33" rx="7" ry="2.3" />
          <circle cx="32" cy="21" r="8" />
        </g>
      )}

      {type === "r" && (
        <g {...common}>
          <path d="M20 52 L22 25 L42 25 L44 52 Z" />
          <rect x="17" y="20" width="30" height="5" rx="0.5" />
          <rect x="17" y="12" width="6" height="8" />
          <rect x="25" y="12" width="6" height="8" />
          <rect x="33" y="12" width="6" height="8" />
          <rect x="41" y="12" width="6" height="8" />
        </g>
      )}

      {type === "b" && (
        <g {...common}>
          <path d="M25 50 C24 38 26 28 32 14 C38 28 40 38 39 50 Z" />
          <ellipse cx="32" cy="48" rx="8" ry="2.2" />
          <path d="M26 29 Q32 24 38 29" fill="none" strokeWidth="2" />
          <circle cx="32" cy="9" r="3" fill={fill} stroke={stroke} strokeWidth="1.6" />
        </g>
      )}

      {type === "n" && (
        <g {...common}>
          <path d="M19 53 C19 47 21 44 25 42 C21 40 19 36 20 31 C21 25 25 20 30 17 C29 20 30 22 32 23 C37 20 40 15 38 10 C44 12 48 18 48 25 C48 30 46 34 43 37 C47 39 49 43 49 47 L49 53 Z" />
          <circle cx="34" cy="21" r="1.6" fill={stroke} stroke="none" />
          <path d="M25 20 L29 18 L27 23 Z" fill={stroke} stroke="none" />
        </g>
      )}

      {type === "q" && (
        <g {...common}>
          <path d="M23 48c-1-8 0-16 3-22h12c3 6 4 14 3 22z" />
          <ellipse cx="32" cy="47" rx="9" ry="2.4" />
          <rect x="20" y="23" width="24" height="4.5" rx="0.5" />
          <path d="M19 23 L22 14 L25 23 Z" />
          <path d="M27.5 23 L30 9 L32.5 23 Z" />
          <path d="M31.5 23 L34 9 L36.5 23 Z" />
          <path d="M39 23 L42 14 L45 23 Z" />
          <circle cx="22" cy="13" r="2" />
          <circle cx="30" cy="8" r="2" />
          <circle cx="34" cy="8" r="2" />
          <circle cx="42" cy="13" r="2" />
        </g>
      )}

      {type === "k" && (
        <g {...common}>
          <path d="M24 48c-1-9 0-17 2-22h12c2 5 3 13 2 22z" />
          <ellipse cx="32" cy="47" rx="9" ry="2.4" />
          <rect x="21" y="27" width="22" height="4" rx="0.5" />
          <rect x="30" y="19" width="4" height="9" />
          <rect x="30" y="7" width="4" height="13" rx="1" />
          <rect x="26" y="11" width="12" height="4" rx="1" />
        </g>
      )}
    </svg>
  );
}
