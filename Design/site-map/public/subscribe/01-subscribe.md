# Subscribe · Signup, confirm, unsubscribe

Three small pages for email subscriptions (feature-plans/email-subscriptions.md).
All reuse the About page's hero + band idioms at the shared 0.8 scale
(`.tg-about .tg-sub`); only the form, the inbox readout, and the cadence strip
are new (`.tg-sub-*` in `public-theme.css`).

- **Sources:** `frontend/src/app/(public)/subscribe/page.tsx`,
  `subscribe/confirm/page.tsx`, `unsubscribe/page.tsx`;
  `components/public/subscribe-form.tsx`, `components/public/token-action-form.tsx`;
  server actions in `lib/subscribe-actions.ts`

## /subscribe

```
Subscribe (.tg-about .tg-sub)
├── Hero (.tg-about-hero)
│   ├── Kicker           ← "// Subscribe"
│   ├── Display Headline ← "Every dispatch, in your inbox." (accent phrase orange)
│   └── Standfirst       ← what arrives and when
└── Band (.tg-about-band) — "/ Sign up" seclabel
    ├── Signup Form (.tg-sub-form)
    │   ├── Label        ← "Email address" (mono sand)
    │   ├── Input + Btn  ← square Archivo input on --tg-band, flush orange
    │   │                  "Subscribe →" button (stack on ≤720px)
    │   └── Message      ← mono orange error line (aria-live)
    │   (on success the form swaps to the Inbox Readout)
    ├── Inbox Readout (.tg-sub-done) ← orange left rule, "// Check your inbox"
    ├── Cadence Strip (.tg-sub-cadence) ← Mon/Thu/Fri + neon format chips
    └── Fine Print (.tg-sub-fine)
```

## /subscribe/confirm and /unsubscribe

Same hero ("One click left." / "Stop the emails?") over a single-button band
(`TokenActionForm`). The action runs on an explicit click, never on page load,
so mail scanners pre-fetching the emailed link can't change anything. The
result swaps in an Inbox Readout (`// You're on the list`, `// Unsubscribed`,
or the invalid-link copy) with a "Read the latest dispatch →" ghost button.
