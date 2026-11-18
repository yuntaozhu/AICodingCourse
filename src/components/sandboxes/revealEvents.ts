import type React from "react";

export function stopRevealKey(e: React.KeyboardEvent) {
  e.stopPropagation();
}

export function stopRevealWheel(e: React.WheelEvent) {
  e.stopPropagation();
}
