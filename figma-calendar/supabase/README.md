# Supabase setup notes

This folder contains SQL for a development-only Figma Calendar demo.

Before running `schema.sql`, check the Supabase dashboard:

- Use a development or test project only.
- Enable Auth > Sign In / Providers > Anonymous Sign-Ins.
- Review Security Advisor findings.
- Limit Auth URL settings and allowed redirect URLs to the local/demo domains you use.
- Consider CAPTCHA or Cloudflare Turnstile before sharing the demo publicly.
- Use only a publishable key or legacy anon key in `supabase-config.js`.
- Never paste a secret key, service_role key, database password, or MCP token into browser files.

Local browser config:

```js
window.FIGMA_CALENDAR_SUPABASE = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  publishableKey: "sb_publishable_...",
  captcha: {
    provider: "turnstile",
    siteKey: "YOUR_CAPTCHA_SITE_KEY",
  },
};
```

`provider` can be `"turnstile"` or `"hcaptcha"`. Put only the CAPTCHA site key in
browser config. The CAPTCHA secret key belongs in the Supabase dashboard only.

`supabase-config.js` is intentionally ignored by git.
