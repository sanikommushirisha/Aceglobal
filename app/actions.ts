"use server";

import { getSql } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/newsletter";

export type LeadResult = { ok: boolean; error?: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Captures a website lead (footer newsletter / contact box) into the `leads`
 * table in Postgres (DATABASE_URL). The website only ever inserts here; reading
 * and managing leads happens outside the site.
 */
export async function submitLead(
  _prev: LeadResult,
  formData: FormData,
): Promise<LeadResult> {
  // Honeypot — bots fill hidden fields; humans never see this one.
  if (String(formData.get("company_website") ?? "").trim()) {
    return { ok: true };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  /* The newsletter form asks for an email and nothing else, so there is no name
     to store. Falling back to the email put the address in both columns, which
     left the admin's Leads list showing a column of addresses under "Name" with
     no way to tell a subscriber from someone who filled in the contact box.
     The fallback is per service rather than blanket: a form that does collect a
     name still uses it, and anything that is not the newsletter keeps the old
     behaviour rather than being mislabelled as a subscriber. */
  const service = String(formData.get("service") ?? "newsletter") || "newsletter";
  const name =
    String(formData.get("name") ?? "").trim() ||
    (service === "newsletter" ? "Newsletter subscriber" : email);

  const sql = getSql();
  if (!sql) {
    return { ok: false, error: "Sign-ups are temporarily unavailable." };
  }

  try {
    await sql`
      insert into leads (name, email, source, service, status)
      values (${name}, ${email}, 'website', ${service}, 'new')
    `;
  } catch (e) {
    console.error(`[leads] insert failed: ${(e as Error)?.message ?? e}`);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  /* Double opt-in. The address is captured above either way, but it does not
     join the mailing list until the link in this email is clicked, so nobody
     can subscribe someone else by typing their address into the footer.
     A failed send is logged and swallowed rather than surfaced: the lead is
     already saved, and telling the subscriber their signup failed would be
     untrue. What they lose is the confirmation, which they can retry. */
  if (service === "newsletter") {
    await sendConfirmationEmail(email);
  }

  return { ok: true };
}
