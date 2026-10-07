import { Sparkle } from "./Sparkle";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${center ? "mx-auto text-center" : ""} max-w-2xl ${className}`}
    >
      {eyebrow && (
        <span className={`eyebrow ${center ? "justify-center" : ""} flex`}>
          <Sparkle size={14} /> {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.1] md:text-[2.6rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
