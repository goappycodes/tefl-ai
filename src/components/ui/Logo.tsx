import Image from "next/image";
import Link from "next/link";

export function Logo({
  className = "",
  height = 30,
  priority = false,
}: {
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  // Logo aspect ratio ≈ 4.42 (2997×678)
  const width = Math.round(height * 4.42);
  return (
    <Link
      href="/"
      aria-label="TEFL.ai home"
      className={`inline-flex items-center ${className}`}
    >
      <Image
        src="/brand/tefl-ai-logo.png"
        alt="TEFL.ai"
        width={width}
        height={height}
        priority={priority}
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}
