import { ArrowRight, Check } from "lucide-react";
import * as Icons from "lucide-react";
import { type Course, courseUrl, formatPrice } from "@/content/courses";

function CIcon({ name, className }: { name: string; className?: string }) {
  const Cmp =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ??
    Icons.GraduationCap;
  return <Cmp className={className} />;
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="ring-card surface-card relative flex flex-col p-7">
      <div className="flex items-center justify-between">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
          <CIcon name={course.icon} className="h-7 w-7" />
        </span>
        {course.badge && <span className="chip">{course.badge}</span>}
      </div>

      <h3 className="mt-5 text-xl font-semibold text-[var(--color-ink)]">
        {course.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
        {course.blurb}
      </p>

      <ul className="mt-5 space-y-2">
        {course.highlights.slice(0, 3).map((h) => (
          <li key={h} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
            <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--color-success)]" />
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-end justify-between border-t border-[var(--color-border)] pt-5">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--color-ink)]">
              {formatPrice(course.price, course.currency)}
            </span>
            {course.regularPrice && (
              <span className="text-sm text-[var(--color-faint)] line-through">
                {formatPrice(course.regularPrice, course.currency)}
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--color-faint)]">{course.duration}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <a
          href={courseUrl(course.slug)}
          className="btn btn-ghost flex-1 !py-2.5 text-sm"
        >
          Learn more
        </a>
        <a href={courseUrl(course.slug)} className="btn btn-primary flex-1 !py-2.5 text-sm">
          Enrol <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
