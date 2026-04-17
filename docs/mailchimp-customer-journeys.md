# Mailchimp Customer Journeys

Harvest Drone now uses Mailchimp Customer Journeys for customer-facing email delivery. Supabase still tracks enrollments and workflow state, but customer emails should be triggered by Mailchimp tags instead of Resend.

## Merge Fields To Verify

In Mailchimp, go to `Audience -> Settings -> Audience fields and *|MERGE|* tags` and confirm these fields exist:

| Field name | Merge tag | Type |
| --- | --- | --- |
| State | `STATE` | Text |
| County | `COUNTY` | Text |
| Acres | `ACRES` | Number |
| Phone | `PHONE` | Phone |

## Journey 1: Farm Day Reactivation

- Trigger: tag added `farm-day-warm`
- Emails: Farm Day email 1 through 6
- Delays: day 0, day 2, day 5, day 8, day 12, day 18
- Exit when tag `source-order` is added
- Exit when tag `grower-funnel` is added

## Journey 2: Grower Welcome

- Trigger: tag added `grower-funnel`
- Emails: 7-grower-email sequence from `drip_emails`
- Delays: day 0, day 2, day 4, day 7, day 10, day 14, day 21
- Exit when tag `source-order` is added

## Journey 3: Operator Welcome

- Trigger: tag added `operator-funnel`
- Emails: 5-operator-email sequence from `drip_emails`
- Delays: day 0, day 2, day 5, day 8, day 12

## Journey 4: SOURCE Order Confirmation

- Trigger: tag added `source-order`
- Emails: order confirmation plus application tips
- Delays: day 0 and day 3

## Journey 5: SOURCE Post-Purchase

- Trigger: tag added `source-paid`
- Emails: delivery update, application tips, EarthOptics offer, referral ask
- Delays: day 0, day 3, day 10, day 21

## Team Notes

- Form submissions should add or update the contact in Mailchimp, then apply the journey tags.
- If a Farm Day contact converts, remove the `farm-day-warm` tag so that sequence exits cleanly.
- If a SOURCE order is marked paid in the CRM or by the internal agent, add the `source-paid` tag so the post-purchase journey starts.
- Resend remains in use only for internal notifications to `ADMIN_EMAIL` and for invoice reminder emails.
