"use client";

import { Loader2 } from "lucide-react";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-sm font-medium text-[var(--color-ink)]"
        >
          {label}
          {required && <span className="text-[var(--color-accent)]">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-[var(--color-faint)]">{hint}</p>}
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return <input {...props} className={`input-tai ${props.className || ""}`} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`input-tai min-h-32 resize-y ${props.className || ""}`}
    />
  );
}

export function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`input-tai cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%23a6b2cf%22 stroke-width=%222%22><path d=%22M4 6l4 4 4-4%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10 ${props.className || ""}`}
    >
      {children}
    </select>
  );
}

export function RadioCards<T extends string>({
  name,
  value,
  onChange,
  options,
  columns = 2,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; desc?: string }[];
  columns?: 2 | 3 | 4;
}) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <div className={`grid grid-cols-1 gap-2.5 ${cols}`} role="radiogroup">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
              active
                ? "border-[var(--color-accent)] bg-[rgba(58,208,248,0.12)] text-[var(--color-ink)] shadow-[0_0_0_1px_var(--color-accent),0_12px_30px_-14px_rgba(58,208,248,0.55)]"
                : "border-[var(--color-border)] bg-white/[0.03] text-[var(--color-muted)] hover:-translate-y-0.5 hover:border-[rgba(58,208,248,0.55)] hover:bg-white/[0.06] hover:text-[var(--color-ink)]"
            }`}
          >
            <span
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                active ? "border-[var(--color-accent)]" : "border-[var(--color-faint)] group-hover:border-[var(--color-muted)]"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] transition-transform duration-200 ${
                  active ? "scale-100" : "scale-0"
                }`}
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">{o.label}</span>
              {o.desc && <span className="mt-0.5 block text-xs text-[var(--color-faint)]">{o.desc}</span>}
            </span>
            <input type="radio" name={name} value={o.value} checked={active} readOnly className="sr-only" />
          </button>
        );
      })}
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      type="submit"
      disabled={loading || props.disabled}
      className={`btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Generating…
        </>
      ) : (
        children
      )}
    </button>
  );
}
