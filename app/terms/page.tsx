import { pageMetadata } from "@/lib/site";
import { Contact, LegalDoc, LegalLink, Section } from "@/components/legal/legal-doc";
import { PUBLISHER_ALIAS } from "@/lib/legal";

export const metadata = pageMetadata({
  title: "Terms of Use · Manuscript Builder",
  description: "Terms for creating, saving and exporting documents with Manuscript Builder.",
  path: "/terms", noindex: true,
});

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Use">
      <Section title="1. About these terms">
        <p>These terms govern your use of Manuscript Builder, published by {PUBLISHER_ALIAS} as part of Bag Of Holding Tools. The editor is free to use, with or without an account. By using it, you agree to these terms. If you do not agree, please stop using the service.</p>
      </Section>
      <Section title="2. Eligibility and accounts">
        <p>You must have the legal capacity to accept these terms. Minors must have permission from a parent or legal guardian. The service is not directed at children under 15.</p>
        <p>Google sign-in is optional and uses the shared Bag Of Holding Tools account. Keep that account secure and do not use another person’s identity without authorization. Manuscripts created in your dashboard or explicitly imported into your account are saved online and can be opened on other devices. Signing in alone does not upload an existing guest draft.</p>
      </Section>
      <Section title="3. Local drafts and backups">
        <p>The guest editor saves its current manuscript in this browser, including when you are signed in. The account editor saves manuscripts to your account and shows whether saving succeeded. Browser storage is not a guaranteed backup: clearing site data, using private browsing, changing devices or exceeding storage limits may make your work unavailable.</p>
        <p>Use Download JSON in the export menu to keep an editable backup. Importing a manuscript replaces the current draft. PNG exports are rendered documents, not editable backups. The publisher cannot recover drafts stored only on your device.</p>
      </Section>
      <Section title="4. Your content">
        <p>You retain the rights you hold in your manuscripts, illustrations and exports. You must have the necessary rights to the text, images and personal information you import. Do not use the service to infringe copyright, privacy or other people’s rights.</p>
        <p>Saved manuscripts are private to your account. The editor does not publish manuscripts or create public sharing links. If you distribute an exported file, you control its recipients and are responsible for that distribution.</p>
      </Section>
      <Section title="5. Acceptable use">
        <ul className="list-disc space-y-1 pl-5">
          <li>Do not use the service for unlawful activity or to create or distribute unlawful content.</li>
          <li>Do not attempt unauthorized access, bypass security controls, or interfere with the service or its providers.</li>
          <li>Do not impersonate others or use material you are not entitled to use.</li>
        </ul>
        <p>We may restrict access for misuse or to protect the service. Report a problem to <Contact />.</p>
      </Section>
      <Section title="6. Availability and responsibility">
        <p>The service is provided as available. We may change features or interrupt access for maintenance, security or other operational reasons. We do not guarantee uninterrupted access, error-free operation or preservation of browser drafts.</p>
        <p>To the extent permitted by applicable law, the publisher is not responsible for losses resulting from interruptions, misuse or loss of local drafts. Nothing in these terms excludes liability or statutory rights that cannot lawfully be excluded.</p>
      </Section>
      <Section title="7. Account deletion">
        <p>You can request deletion from the <LegalLink href="/account">Account page</LegalLink> or by contacting <Contact />. Deleting the shared sign-in affects access to other Bag Of Holding Tools apps. It does not clear browser drafts or copies of exported files; those must be removed on your own devices.</p>
      </Section>
      <Section title="8. Privacy">
        <p>See the <LegalLink href="/privacy">Privacy Policy</LegalLink> for information about personal data and the <LegalLink href="/cookies">Cookie Policy</LegalLink> for browser storage and authentication cookies.</p>
      </Section>
      <Section title="9. Changes, applicable law and contact">
        <p>Updates to these terms will be published here with a revised date. French law applies, without removing any mandatory protections available under the law of your country of residence. Any dispute is subject to the courts determined by applicable law.</p>
        <p>For questions or an attempt to resolve a dispute amicably, contact <Contact />.</p>
      </Section>
    </LegalDoc>
  );
}
