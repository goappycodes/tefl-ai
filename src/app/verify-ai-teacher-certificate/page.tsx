import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { CertificateVerifier } from "@/components/certificate/CertificateVerifier";
import { Sparkle } from "@/components/ui/Sparkle";

export const metadata: Metadata = {
  title: "Verify an AI-Skilled Teacher Certificate",
  description:
    "Confirm the authenticity of an AI-Skilled Teacher Certificate issued by TEFL.ai.",
  alternates: { canonical: "/verify-ai-teacher-certificate" },
};

export default function VerifyAiTeacherCertificatePage() {
  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <Sparkle size={22} className="absolute left-[13%] top-28 animate-float opacity-40" />
        <div className="container-tai text-center">
          <span className="chip mx-auto"><BadgeCheck className="h-4 w-4 text-[var(--color-accent)]" /> AI-Skilled Teacher Certificate</span>
          <h1 className="mx-auto mt-6 max-w-2xl text-balance text-4xl font-bold leading-[1.05] md:text-5xl">
            Verify an <span className="text-gradient">AI-Skilled Teacher</span> certificate
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Enter the certificate number to confirm it was genuinely issued by TEFL.ai.
          </p>
        </div>
      </section>
      <section className="container-tai mt-12">
        <CertificateVerifier />
      </section>
    </>
  );
}
