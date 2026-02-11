"use client";

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      className="toggle"
      data-on={on ? "true" : "false"}
      onClick={onToggle}
      aria-label={on ? "On" : "Off"}
      type="button"
    >
      <span className="knob" />
    </button>
  );
}
