# Qasr-us-Salam Madrasa Management System — Next.js App

This is the real app connected to your Supabase database. All modules are wired to real data.

## ⚠️ Do this first: extra database tables
This version uses 2 new tables (`progress_notes`, `settings`) that were not in the original `schema.sql`.
Go to **Supabase → SQL Editor**, paste the contents of `schema_additions.sql` (attached), and Run it — only needs to be done once.

## What's working now
- **Login** — real Supabase authentication
- **Role-based access** — Mohtamim/Nazim/Teacher each see their own sidebar and pages
- **Dashboard** — real numbers (students, teachers, income/expense, pending fees, attendance)
- **Students** — list, profile drawer, new admission, edit student
- **Teachers** — list, create new teacher account (creates their login), edit, disable/enable
- **Classes** — create classes, assign teachers, see student counts
- **Attendance** — mark daily attendance for students & teachers
- **Fees** — collection, paid/pending filter, add new fee entry
- **Salary** — generate salary slips per teacher, view salary history
- **Income / Expenses** — category cards, entries, add new entry
- **Reports** — real totals (income, expense, balance, students, teachers, attendance, fees)
- **User Management** — create new users (any role), reset password, disable/enable
- **Settings** — edit madrasa info (Mohtamim only)
- **Other Funds** — Nazim adds fund entries
- **Student Progress** — Teacher updates sabaq/sabqi/manzil, adds remarks
- **My Profile** — Teacher views their class, students, salary slip

## How to run

1. **Update the database** (see the warning above — run `schema_additions.sql`)

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and add your Supabase keys:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the app:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser and log in.

## Deploying to Vercel
1. Push this whole folder to a GitHub repository.
2. On vercel.com, click "Add New Project" → select your repo.
3. Add the same 3 environment variables under Project Settings → Environment Variables.
4. Click Deploy.
5. In Supabase → Authentication → URL Configuration, update "Site URL" to your live Vercel URL.

## Note
Creating teacher/user accounts uses the `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to the browser) — make sure this key is set in your environment variables both locally and on Vercel.
