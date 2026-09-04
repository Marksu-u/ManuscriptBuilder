import { pageMetadata } from "@/lib/site";
import { Contact, LegalDoc, LegalLink, Section } from "@/components/legal/legal-doc";
import { HOST, PUBLISHER_ALIAS } from "@/lib/legal";

export const metadata = pageMetadata({
  title: "Privacy Policy · Manuscript Builder",
  description: "How Manuscript Builder handles local drafts, optional sign-in and personal data.",
  path: "/privacy", noindex: true,
});

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy">
      <Section title="1. Scope and controller">
        <p>This policy describes Manuscript Builder’s current data handling. The controller is its publisher, {PUBLISHER_ALIAS}, an individual operating Bag Of Holding Tools on a personal and non-commercial basis. For privacy questions or requests, contact <Contact />. Publisher and hosting details are in the <LegalLink href="/legal">Legal Notice</LegalLink>.</p>
        <p>Personal data is information that identifies you directly or indirectly. We handle it under the GDPR and applicable French data protection law. Other Bag Of Holding Tools apps share sign-in but describe their own features in their own policies.</p>
      </Section>
      <Section title="2. Manuscripts stay in this browser">
        <p>The current editor stores the manuscript name, pages, text, formatting, selected style and imported illustrations in your browser. This applies to guests and signed-in users. The editor does not upload these drafts to our account database or sync them between devices.</p>
        <p>Image imports, JSON imports and PNG or JSON exports are processed on your device. We cannot read or recover your local drafts through the service. Content you choose to email to support or share with another service is outside this local-only workflow.</p>
      </Section>
      <Section title="3. Optional Google sign-in">
        <p>If you choose Google sign-in, Google and Supabase process the identity and session information needed to authenticate you. This may include your email address, account identifiers and profile metadata supplied by Google. We do not receive your Google password.</p>
        <p>Manuscript Builder’s account record contains your email address, shared authentication identifier and account timestamps. We use these to identify your account and provide account management. The legal basis is performance of the account service you request. You can edit manuscripts without supplying this information.</p>
      </Section>
      <Section title="4. Technical and support information">
        <p>Hosting and authentication providers process connection information, such as IP addresses, request times, browser information and authentication events, to deliver and secure the service. This is separate from manuscript content. We rely on our legitimate interest in operating a reliable service and preventing abuse.</p>
        <p>If you contact support, we receive your email address and the information you send. We use it to answer your request, based on our legitimate interest in providing support or on a legal obligation when responding to a data-rights request. We do not use your data for advertising or sell it.</p>
      </Section>
      <Section title="5. Providers and international processing">
        <ul className="list-disc space-y-2 pl-5">
          <li><LegalLink href="https://supabase.com/privacy">Supabase</LegalLink> provides shared authentication and account database hosting.</li>
          <li><LegalLink href={HOST.privacyUrl}>Vercel</LegalLink> hosts and delivers the application.</li>
          <li><LegalLink href="https://policies.google.com/privacy">Google</LegalLink> provides sign-in when you choose it.</li>
        </ul>
        <p>These providers may process technical or account information outside your country, including in the United States. Their privacy notices describe processing locations and transfer safeguards. Provider data-processing terms describe applicable contractual safeguards, including standard contractual clauses. Contact us for information about safeguards applicable to your data.</p>
        <p>We may also disclose information where required by law. The app does not integrate Google Analytics, advertising trackers or behavioral profiling. See the <LegalLink href="/cookies">Cookie Policy</LegalLink>.</p>
      </Section>
      <Section title="6. Retention and deletion">
        <p>Your local draft remains until it is replaced, you clear this site’s browser storage, or your browser removes it. Downloaded files remain wherever you save them. Signing out or deleting your account does not erase either kind of local copy.</p>
        <p>Account records are retained while your account exists. The <LegalLink href="/account">Account page</LegalLink> lets you delete the shared sign-in and Manuscript Builder account records. This affects sign-in to the other suite apps. Contact us if you need help with data held by another tool.</p>
        <p>Support correspondence is kept for the time needed to resolve and follow up on the request. Technical logs and provider backups follow the providers’ configured retention cycles; deletion from active records may not immediately remove backup copies. Information needed to meet a legal obligation or resolve a dispute may be retained for that purpose.</p>
      </Section>
      <Section title="7. Your choices and rights">
        <p>Where the applicable legal conditions are met, you can request access, correction, erasure, restriction or portability of your personal data, and object to processing based on legitimate interests. Where processing relies on consent, you can withdraw that consent. French law also provides for instructions concerning personal data after death.</p>
        <p>Contact <Contact /> to exercise your rights. We normally respond within one month; if a permitted extension is necessary, we will explain it within that period. We may request information reasonably needed to verify your identity.</p>
        <p>You can export your local manuscript using Download JSON and remove it by clearing this site’s browser data. We cannot clear drafts on your device remotely.</p>
        <p>You may complain to your data protection authority, including the <LegalLink href="https://www.cnil.fr/en">CNIL</LegalLink> in France.</p>
      </Section>
      <Section title="8. Security, children and updates">
        <p>We use authentication and access controls to protect account data. No service or device is completely secure; protect access to your browser and keep backups of important manuscripts.</p>
        <p>The service is not directed at children under 15. If you believe a child has provided account data inappropriately, contact us. If our data handling changes, we will update this page and its date and provide any additional notice required.</p>
      </Section>
    </LegalDoc>
  );
}
