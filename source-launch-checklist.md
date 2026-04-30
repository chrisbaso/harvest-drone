# SOURCE Launch Checklist

## Funnel
- [x] SOURCE-first landing page exists at `/source-acre-review`
- [x] Hero promise matches the SOURCE Acre Review offer
- [x] Primary CTA is `Get My SOURCE Acre Review`
- [x] Secondary CTA is `Talk With Jake`
- [x] Mobile-first form and review panel are in place
- [x] Thank-you page exists

## Form and Lead Handling
- [x] Required fields: name, phone, email, state, county/town, crop, acres, fertility concern
- [x] Optional fields: N notes, P notes, preferred contact method, timeline, interest type, additional notes
- [x] Directional review output uses priority and conversation focus instead of fake ROI math
- [x] Lead scoring creates `Hot`, `Warm`, or `Researching`
- [x] Priority tags include SOURCE-specific tags
- [x] SOURCE review requests flow through the grower lead pipeline

## Tracking
- [x] `NEXT_PUBLIC_META_PIXEL_ID` is supported in the Vite client
- [x] `ViewContent` is wired for the landing page
- [x] `Lead` fires only after successful submit
- [x] UTM capture and persistence are wired
- [x] Lead payload includes `landing_page` and `page_version`

## Storage and Notifications
- [x] Grower lead schema includes SOURCE review fields and UTMs
- [x] Remote Supabase migration `20260424_source_acre_review_launch.sql` has been pushed
- [x] Internal notification email supports SOURCE-specific subject lines
- [x] Lead submission no longer fails just because email notification vars are missing

## Compliance
- [x] No guaranteed yield or profit claims on the new SOURCE page
- [x] No fake ROI calculator on the new SOURCE page
- [x] Disclaimer is visible near the footer and in the review output
- [x] Privacy policy link exists
- [x] Terms and disclaimer link exists

## QA to Recheck Before Hitting Publish
- [x] Verify the production domain resolves to the new route
- [ ] Verify `NEXT_PUBLIC_META_PIXEL_ID` is set in Vercel if you want live Meta event tracking
- [ ] Verify `INTERNAL_NOTIFICATION_EMAIL` and `RESEND_API_KEY` are set if you want live email alerts
- [ ] Submit one live test lead with UTMs on the production domain
- [ ] Confirm the lead record in Supabase contains acres, concern, timeline, interest, and UTMs
- [ ] Confirm the thank-you page renders correctly on mobile
- [ ] Confirm Jake's phone CTA is correct for the campaign
