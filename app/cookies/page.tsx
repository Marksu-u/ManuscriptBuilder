import type { Metadata } from "next";
import { Contact, LegalDoc, LegalLink, Section } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Cookie Policy · Manuscript Builder",
  description: "Browser storage and essential sign-in cookies used by Manuscript Builder.",
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalDoc title="Cookie Policy">
      <Section title="1. Cookies and browser storage">
        <p>Cookies are small pieces of information stored by a website in your browser. Local storage is another browser mechanism that keeps data on your device. This page covers both technologies as used by Manuscript Builder.</p>
      </Section>
      <Section title="2. Essential sign-in cookies">
        <p>If you sign in, Supabase uses authentication cookies, generally named <code className="break-all text-zinc-300">sb-…-auth-token</code> (sometimes split into numbered parts), to maintain and refresh your session. The sign-in flow may also use temporary cookies to complete authentication securely.</p>
        <p>These support the account service you request, rather than advertising or analytics. Session cookies are renewed while the session is active and are removed on sign-out or expire according to the authentication settings. Blocking or deleting them can sign you out or prevent sign-in. Guest editing remains available.</p>
      </Section>
      <Section title="3. Local manuscript storage">
        <p>The browser storage entry <code className="break-all text-zinc-300">boh-manuscript-v1</code> holds your current manuscript: its name, pages, text, formatting, theme, illustrations and selected page. It is used for both guests and signed-in users, so your work can be restored in the same browser.</p>
        <p>This entry has no automatic expiry set by the app. It remains until replaced, cleared by you, or removed by the browser. It is not sent to our servers by the editor. Signing out or deleting your account does not clear it.</p>
      </Section>
      <Section title="4. No optional tracking">
        <p>Manuscript Builder does not integrate analytics, advertising, social-media tracking or personalization cookies. There is no analytics consent record or optional tracking preference to enable in this app.</p>
        <p>The storage described above supports saving the work and authentication you request. Necessary storage is distinguished from consent-based tracking in the <LegalLink href="https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi">CNIL’s guidance on cookies and trackers</LegalLink>. If optional tracking is introduced, we will update this policy and request consent where required before activating it.</p>
      </Section>
      <Section title="5. Managing or clearing storage">
        <p>Use your browser’s site-data settings to inspect, block or delete cookies and local storage for Manuscript Builder. Download a JSON backup from the editor’s export menu first if you want to keep an editable copy. Clearing site data can permanently remove your draft and sign you out.</p>
        <p>Browser storage belongs to this site’s origin. Clearing data for a different Bag Of Holding Tools app does not necessarily clear Manuscript Builder’s draft, and clearing this site does not remove exported files.</p>
      </Section>
      <Section title="6. More information">
        <p>For account information and your data rights, see our <LegalLink href="/privacy">Privacy Policy</LegalLink>. Questions: <Contact />.</p>
      </Section>
    </LegalDoc>
  );
}
