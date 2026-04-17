import { createHash } from "https://deno.land/std@0.177.0/hash/mod.ts";

const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
const MAILCHIMP_SERVER = Deno.env.get("MAILCHIMP_SERVER_PREFIX");
const MAILCHIMP_LIST_ID = Deno.env.get("MAILCHIMP_LIST_ID");

if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER || !MAILCHIMP_LIST_ID) {
  throw new Error("Missing Mailchimp environment variables.");
}

const BASE_URL = `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0`;

export interface MailchimpContact {
  email: string;
  firstName?: string;
  lastName?: string;
  state?: string;
  county?: string;
  acres?: string;
  phone?: string;
  tags: string[];
  mergeFields?: Record<string, string | number>;
}

function getAuthHeader() {
  return "Basic " + btoa(`anystring:${MAILCHIMP_API_KEY}`);
}

async function parseMailchimpError(response: Response) {
  try {
    const data = await response.json();
    return data.detail || data.title || `Mailchimp request failed with ${response.status}`;
  } catch {
    return `Mailchimp request failed with ${response.status}`;
  }
}

async function md5Hash(input: string) {
  const hash = createHash("md5");
  hash.update(input);
  return hash.toString();
}

export async function upsertContact(contact: MailchimpContact): Promise<{ success: boolean; error?: string }> {
  try {
    const email = contact.email.trim().toLowerCase();
    const emailHash = await md5Hash(email);

    const memberData: Record<string, unknown> = {
      email_address: email,
      status_if_new: "subscribed",
      merge_fields: {
        FNAME: contact.firstName || "",
        LNAME: contact.lastName || "",
        ...(contact.mergeFields || {}),
      },
    };

    const mergeFields = memberData.merge_fields as Record<string, string | number>;
    if (contact.state) mergeFields.STATE = contact.state;
    if (contact.acres) mergeFields.ACRES = contact.acres;
    if (contact.phone) mergeFields.PHONE = contact.phone;
    if (contact.county) mergeFields.COUNTY = contact.county;

    const upsertRes = await fetch(`${BASE_URL}/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}`, {
      method: "PUT",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memberData),
    });

    if (!upsertRes.ok) {
      return { success: false, error: await parseMailchimpError(upsertRes) };
    }

    if (contact.tags.length > 0) {
      const tagRes = await fetch(`${BASE_URL}/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}/tags`, {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tags: contact.tags.map((tag) => ({ name: tag, status: "active" })),
        }),
      });

      if (!tagRes.ok) {
        return { success: false, error: `Tags failed: ${await parseMailchimpError(tagRes)}` };
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown Mailchimp error" };
  }
}

export async function removeTag(email: string, tag: string): Promise<{ success: boolean; error?: string }> {
  try {
    const emailHash = await md5Hash(email.trim().toLowerCase());
    const response = await fetch(`${BASE_URL}/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}/tags`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tags: [{ name: tag, status: "inactive" }],
      }),
    });

    if (!response.ok) {
      return { success: false, error: await parseMailchimpError(response) };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown Mailchimp error" };
  }
}
