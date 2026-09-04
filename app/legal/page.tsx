import type { Metadata } from "next";
import { Contact, LegalDoc, LegalLink, Section } from "@/components/legal/legal-doc";
import { HOST, PUBLISHER_ALIAS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Legal Notice · Manuscript Builder",
  description: "Publisher, hosting and contact details for Manuscript Builder.",
  robots: { index: false, follow: true },
};

export default function LegalNoticePage() {
  return (
    <LegalDoc title="Legal Notice">
      <Section title="Site publisher">
        <p>Manuscript Builder is a free tabletop roleplaying document editor, part of Bag Of Holding Tools. It is published by an individual acting on a personal and non-commercial basis under the pseudonym {PUBLISHER_ALIAS}. The publisher’s identifying details are held by the hosting provider.</p>
        <p>Publication director: {PUBLISHER_ALIAS}. Contact: <Contact />.</p>
      </Section>
      <Section title="Hosting">
        <p>The application is hosted by {HOST.name}, {HOST.address}. Website: <LegalLink href="https://vercel.com">vercel.com</LegalLink>. Host contact: <LegalLink href={`mailto:${HOST.email}`}>{HOST.email}</LegalLink>.</p>
        <p>Shared sign-in and account data are hosted by <LegalLink href="https://supabase.com">Supabase</LegalLink>. Manuscript drafts in the current editor are stored in your browser. See our <LegalLink href="/privacy">Privacy Policy</LegalLink> for the distinction.</p>
      </Section>
      <Section title="Intellectual property">
        <p>The application, branding and original assets are protected by intellectual property law. Third-party components and assets remain subject to their respective rights and licenses. Any license supplied with the source code governs use of that code.</p>
        <p>You retain the rights you hold in the manuscripts, text and illustrations you create or import. The publisher does not claim ownership of your content. You are responsible for having permission to use third-party material.</p>
      </Section>
      <Section title="External links">
        <p>Linked third-party websites are operated independently and have their own terms and privacy practices. A link does not imply control over or endorsement of their content.</p>
      </Section>
      <Section title="Policies for this app">
        <p>These documents apply directly to Manuscript Builder: <LegalLink href="/terms">Terms of Use</LegalLink>, <LegalLink href="/privacy">Privacy Policy</LegalLink> and <LegalLink href="/cookies">Cookie Policy</LegalLink>.</p>
      </Section>
    </LegalDoc>
  );
}
