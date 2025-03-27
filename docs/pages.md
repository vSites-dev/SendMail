# Core Routes and Pages Documentation

This document lists the core routes for the email marketing platform. The routes are divided into two sections: Next.js routes (including pages and Next.js API routes) and Express routes. Use this guide as a reference for route management and integration.

## Next.js Routes

### Client-side Pages

- `/` - Dashboard (Home).
- `/kampanyok` - Data table of all campaigns, with options to create and view details of one.
  - `/kampanyok/uj` - Create new campaign.
  - `/kampanyok/:id` - View and manage a specific campaign.
- `/kontaktok` - Data table of all subscribers, with options to create and view details of one.
  - `/kontaktok/uj` - Create new subscriber.
  - `/kontaktok/:id` - View and manage a specific subscriber.
- `/sablonok` - Grid of all templates in card format, with options to create and view details of one.
  - `/sablonok/uj` - Create new template.
  - `/sablonok/:id` - View and manage a specific template.
- `/emailek` - Data table of all emails, with options to view details of one.
  - `/emailek/:id` - View and manage a specific email.
- `/domainek` - Data table of all domains, with options to create and view details of one.
  - `/domainek/uj` - Create new domain.
  - `/domainek/:id` - View and manage a specific domain.
- `/beallitasok` - Settings page for the given user.
- `/projekt/:id` - View and manage a specific project.
- `/uj-projekt` - The onboarding of creating a new project.
- `/bejelentkezes` - Login page.
- `/regisztracio` - Registration page.
- `/kijelentkezes` - Logout page.

## Express Routes

Express routes serve as dedicated backend endpoints for outside consumers to face the public API of it and are constructed separately from the Next.js tRPC backend.

- `/api/domains/verify` - Verifies a new domain.
- `/api/email/send` - Sends an email.
- 1 minute cron job - Checks for pending tasks and processes them.
