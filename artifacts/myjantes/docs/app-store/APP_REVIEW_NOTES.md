# App Review Notes — MyTools Admin

## For Apple App Store Review Team

### App Overview

MyTools Admin is a B2B mobile application exclusively designed for garage administrators and employees of MyTools Group partner garages in France. This is a closed-access, enterprise tool — not a public-facing consumer app.

---

## Demo Account for Review

Please use the following test credentials to access the app:

| Field    | Value                    |
|----------|--------------------------|
| Email    | review@mytoolsgroup.eu   |
| Password | Review2024!              |
| Role     | admin                    |

> **Note:** These credentials provide full admin access to a sandbox environment. All data is test data and does not represent real clients or transactions.

---

## No Public Registration — By Design

**This is intentional and required.**

MyTools Admin is a closed-access enterprise application. Public account creation is intentionally disabled because:

1. The app manages sensitive business data (client PII, financial invoices, garage KPIs)
2. Access is managed exclusively by MyTools Group's customer service team
3. Every user must be vetted and associated with a real partner garage
4. This follows Apple's guidelines for enterprise/B2B applications (Guideline 2.1)

The registration page (`/register`) displays legal information and contact details for obtaining access — it is not a registration form.

---

## Features Available for Review

Using the demo account, the reviewer can access:

### Dashboard (`/`)
- Analytics overview with real KPI cards
- Revenue chart (last 6 months)
- Invoice and quote status breakdowns

### Quotes (`/quotes`)
- Full list of quotes with status badges
- Create new quote (tap + button)
- Edit existing quote
- Change quote status
- Delete quote

### Invoices (`/invoices`)
- Full list of invoices with status badges
- Create new invoice
- Edit existing invoice
- Delete invoice

### Reservations (`/reservations`)
- List of appointments
- Create new reservation with integrated calendar picker
- Edit and delete reservations

### Clients (`/clients`)
- Full client database
- Create, edit, delete clients

### Account Deletion
- Available from the dashboard header (trash icon)
- Two-step confirmation process
- Permanently deletes account and all associated data

---

## Technical Notes

- **Backend:** Proxied through our Express server to `https://saas.mytoolsgroup.eu/api`
- **Auth:** JWT Bearer token + session cookie (dual auth for mobile/web compatibility)
- **Data:** All API calls go through our own backend proxy — no direct third-party API keys in the app
- **Permissions:** Camera (photo attachments on quotes) and photo library (image selection)
- **No tracking:** No analytics SDK, no advertising frameworks

---

## Permissions Justification

| Permission               | Reason                                                    |
|--------------------------|-----------------------------------------------------------|
| Camera                   | Attach photos to quotes (vehicle damage, parts, etc.)     |
| Photo Library (Read)     | Select existing photos to attach to quotes                |
| Internet Access          | Required to communicate with MyTools Group backend API    |

---

## Compliance Checklist

- [x] No third-party login (Sign in with Apple not applicable — B2B enterprise)
- [x] Privacy policy accessible from login screen
- [x] Legal information accessible from login screen
- [x] Account deletion available in-app (two-step confirmation)
- [x] GDPR consent screen on first launch
- [x] No advertising or tracking
- [x] No in-app purchases or subscriptions
- [x] App functions as described
- [x] No reference to competitor platforms
- [x] Content appropriate for 4+ age rating
