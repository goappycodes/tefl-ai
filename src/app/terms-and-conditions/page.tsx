import type { Metadata } from "next";
import { TERMS_HTML } from "@/content/terms-content";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "The terms and conditions governing the use of TEFL.ai, part of The TEFL Institute Limited.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <article className="pt-28 md:pt-32">
      <div className="container-tai max-w-3xl">
        <h1 className="text-balance text-3xl font-bold leading-[1.1] md:text-5xl">
          Terms and Conditions
        </h1>
        <div
          className="prose-tai mt-10"
          dangerouslySetInnerHTML={{ __html: TERMS_HTML }}
        />
      </div>
    </article>
  );
}
