# AfterCredits

Personal media tracking with React and Supabase.

## Supabase setup

1. Create a project at https://supabase.com/dashboard.
2. Open **SQL Editor** and run every file in `supabase/migrations/` in filename order.
3. Open **Authentication > Providers > Google**, enable Google, and follow the displayed Google OAuth setup instructions.
4. In **Authentication > URL Configuration**, set the production Site URL and add any preview deployment URLs you use.
5. Copy `.env.example` to `.env` and fill in the Project URL and Publishable key from **Project Settings > API**.

Never put the Supabase secret/service-role key in a `VITE_` variable. The browser uses only the publishable key; Row-Level Security protects user data.

## Development

```bash
npm install
npm run dev
```

## Deployment

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the deployment platform. Add the deployed URL to Supabase Authentication URL Configuration. The app uses the current deployed origin for the OAuth return URL, so no domain is hardcoded.

## Project structure

```text
src/                  React application
server/               Express development and production server
supabase/migrations/  Database schema and security policies
```
