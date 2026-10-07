import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { CertificateVerifier } from "@/components/certificate/CertificateVerifier";
import { Sparkle } from "@/components/ui/Sparkle";

export const metadata: Metadata = {
  title: "Certificate Verification",
  description:
    "Verify the authenticity of a TEFL.ai certificate. Enter the certificate number to confirm it's genuine.",
  alternates: { canonical: "/certificate-verification" },
};

export default function CertificateVerificationPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <Sparkle size={22} className="absolute right-[14%] top-28 animate-float opacity-40" />
        <div className="container-tai text-center">
          <span className="chip mx-auto"><ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" /> Official verification</span>
          <h1 className="mx-auto mt-6 max-w-2xl text-balance text-4xl font-bold leading-[1.05] md:text-5xl">
            Verify a <span className="text-gradient">TEFL.ai certificate</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Employers and teachers can confirm the authenticity of any TEFL.ai
            certificate in seconds.
          </p>
        </div>
      </section>
      <section className="container-tai mt-12">
        <CertificateVerifier />
      </section>
    </>
  );
}
