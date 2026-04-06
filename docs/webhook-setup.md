# Webhook Setup

This app now has a SOURCE product order flow plus the existing grower, operator, and Hylio funnels. The database-side webhook pattern is:

1. Supabase table receives an `INSERT`
2. Supabase database webhook posts the inserted row payload to Make.com
3. Make.com fans that payload out to email, Nimble CRM, and Mailchimp
4. Jake handles QuickBooks invoicing manually for SOURCE orders

## SQL migration to run

Run this file in Supabase SQL Editor:

- `supabase/migrations/20260406_source_orders_and_make_webhooks.sql`

That migration creates:

- `public.source_orders`
- insert policy for `source_orders`
- database webhooks for `source_orders`, `grower_leads`, and `operator_leads`

## Webhook endpoints and tables

### SOURCE orders
- Table: `public.source_orders`
- Webhook placeholder: `https://hook.us1.make.com/SOURCE_ORDER_WEBHOOK_URL`
- Trigger name: `source_orders_make_webhook`
- Nimble tag: `source-order`
- Mailchimp tag: `source-buyer`

### Grower leads
- Table: `public.grower_leads`
- Webhook placeholder: `https://hook.us1.make.com/GROWER_LEAD_WEBHOOK_URL`
- Trigger name: `grower_leads_make_webhook`
- Nimble tag: `grower`
- Mailchimp tag: `grower`

### Operator leads
- Table: `public.operator_leads`
- Webhook placeholder: `https://hook.us1.make.com/OPERATOR_LEAD_WEBHOOK_URL`
- Trigger name: `operator_leads_make_webhook`
- Nimble tag: `operator`
- Mailchimp tag: `operator`

### Hylio leads
- Current app storage: `public.operator_leads`
- Current app behavior: the Hylio funnel submits through the existing `/api/submit-lead` handler and stores records in `operator_leads`
- How to identify them in Make.com: filter for `lead_tag = "High Ticket"` and/or the Hylio-specific interest fields
- Nimble tag: `hylio`
- Mailchimp tag: `hylio`

If you later create a dedicated `public.hylio_leads` table, add a fourth database webhook using the same trigger pattern and point it to its own Make.com webhook URL.

## Expected Make.com scenario structure

### SOURCE scenario
1. Webhook receives inserted `source_orders` row from Supabase.
2. Send Jake an email with:
   - first name
   - email
   - state
   - crop type
   - acres
   - estimated total
   - order type
3. Create or update contact in Nimble CRM.
4. Apply Nimble tag `source-order`.
5. Create or update subscriber in Mailchimp.
6. Apply Mailchimp tag `source-buyer`.
7. Stop. Jake manually creates and sends the QuickBooks invoice.

### Grower scenario
1. Webhook receives inserted `grower_leads` row.
2. Create or update contact in Nimble CRM.
3. Apply Nimble tag `grower`.
4. Create or update subscriber in Mailchimp.
5. Apply Mailchimp tag `grower`.
6. Optional: notify internal sales/ops email.

### Operator scenario
1. Webhook receives inserted `operator_leads` row.
2. Filter out Hylio records if you want a pure operator-only path.
3. Create or update contact in Nimble CRM.
4. Apply Nimble tag `operator`.
5. Create or update subscriber in Mailchimp.
6. Apply Mailchimp tag `operator`.

### Hylio scenario
There are two workable options:

#### Option A: one Make.com scenario on `operator_leads`
1. Receive inserted `operator_leads` row.
2. Branch if `lead_tag = "High Ticket"`.
3. Create or update contact in Nimble CRM.
4. Apply Nimble tag `hylio`.
5. Create or update subscriber in Mailchimp.
6. Apply Mailchimp tag `hylio`.

#### Option B: split scenarios after the webhook
1. Keep the shared `operator_leads` webhook.
2. Add a Make.com router.
3. Send standard operators down one branch and Hylio records down a separate branch.

## Payload shape

Supabase database webhooks created through `supabase_functions.http_request(...)` send a JSON payload that includes metadata plus the inserted row. In Make.com, map from the inserted record fields you need rather than depending on field order.

For `source_orders`, expect the inserted row to contain at least:
- `id`
- `first_name`
- `email`
- `state`
- `crop_type`
- `acres`
- `estimated_total`
- `order_type`
- `status`
- `created_at`

## How to test each webhook

### SOURCE orders
1. Run the SQL migration.
2. Open `/source` in the app.
3. Submit a test order.
4. Confirm a new row appears in `public.source_orders`.
5. Confirm the Make.com webhook fires.
6. Confirm Jake receives the email.
7. Confirm the Nimble contact is tagged `source-order`.
8. Confirm the Mailchimp subscriber is tagged `source-buyer`.

### Grower leads
1. Submit the grower form at `/growers`.
2. Confirm a new row appears in `public.grower_leads`.
3. Confirm Make.com receives the row.
4. Confirm Nimble and Mailchimp tagging.

### Operator leads
1. Submit the operator form at `/operators`.
2. Confirm a new row appears in `public.operator_leads`.
3. Confirm Make.com receives the row.
4. Confirm Nimble and Mailchimp tagging.

### Hylio leads
1. Submit the Hylio form at `/hylio`.
2. Confirm a new row appears in `public.operator_leads`.
3. Verify the row carries Hylio-identifying fields such as `lead_tag = "High Ticket"`.
4. Confirm the Hylio branch in Make.com runs.
5. Confirm Nimble and Mailchimp get the `hylio` tag.

## QuickBooks invoicing note

SOURCE orders intentionally stop at notification and CRM/email automation. Jake should manually create the QuickBooks invoice after receiving the order email. That human step is appropriate because the average SOURCE order value is high enough to warrant direct follow-up.
