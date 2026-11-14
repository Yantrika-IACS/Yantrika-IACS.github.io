# Admin dashboard setup

The dashboard is at `https://yantrika.in/#/admin`. It is linked from the
**Admin login** link in the footer. Files:

| File | Purpose |
|---|---|
| `admin.js` | Dashboard UI: sign-in, members, pending/approved/rejected applications, approve, reject, edit, delete, CSV export. |
| `supabase/admin_dashboard.sql` | Database setup: admin list, policies, uniqueness, integrity trigger, approval function. Not published (`supabase/` is in `.assetsignore`). |
| `sitemap.js` | Footer, including the Admin login link. |
| `index.html` | Admin route and script hooks. |

## Tables

* `members`: the member list (existing table). The dashboard reads and edits it directly.
* `membership_applications`: Join Us submissions (existing table). New rows start as `pending`.
* `admin_users`: new table listing who may use the dashboard.

## Setup

1. **Check for duplicates.** Run the STEP 0 queries at the top of
   `supabase/admin_dashboard.sql`. Fix any duplicate emails or member IDs in
   `members` before continuing.
2. **Run the whole file** in the SQL Editor. It is safe to re-run.
3. **Create the admin login.** Authentication, then Users, then Add user. Then
   turn off public sign-ups under Sign In / Providers.
4. **Make the login an admin** with the `insert into public.admin_users` line
   at the end of the SQL file.
5. **Deploy**, then hard-refresh with Ctrl+F5.

## How approval works

Approving a pending application asks for a **Member ID** and an **affiliation**.
The `approve_application` function then, in one transaction:

1. checks that the caller is an admin;
2. refuses if the email already belongs to a member;
3. inserts the applicant into `members`;
4. marks the application `approved`.

If any step fails, nothing changes. Rejecting an application only sets its status to
`rejected`, and the record stays for reference.

## Security

* The publishable key in the site code is public by design. Anonymous visitors can
  only insert applications, as before.
* Reads, edits and deletes on `members` and applications need an admin login.
  Enforced by row level security in the database, not by hiding the page.
* The service-role key must never be added to this site.

## Troubleshooting

* **"This account is not an administrator"**: the login's user ID is not in `admin_users`.
* **"Nothing was updated" or "Nothing was deleted"**: a policy blocked the change. Confirm `select public.is_admin();` returns true while signed in as admin.
* **"A member with this email already exists"** or **"That Member ID is already used"**: the value clashes with an existing member. Check the members list.

## Groups and positions

Open **Groups & Positions** in the dashboard.

* Each member's **body** is stored in `members.current_body`, and their
  **designation** in `members.current_designation`. These existing columns are
  what the dashboard reads and writes.
* **Groups** (`member_groups`) are the list of bodies you choose from:
  General Member, IACS Members, Governing Body, Core Committee, Advisory Body.
  You can rename, reorder or add groups. A group that members use cannot be deleted.
* **Positions** (`member_positions`) are the list of designations, each inside a
  group. "Reports to" sets the hierarchy. A position cannot report to itself or
  to one of its own sub-positions. A position that members hold cannot be deleted.
* Renaming a group or position also renames it on every member who has it, in one step.
* To set a member's body and designation, use **Body & role** in All Members.

Each member has one body and one designation, so the dashboard keeps no
history of past positions.

Tables: `member_groups` and `member_positions` are new. The existing `members` and
`appointments` tables are not changed. `member_group_memberships`,
`member_position_holders` may exist from an earlier version of this setup. The
dashboard no longer uses them. Check they are empty, then delete them.

## Other features

* **Overview breakdown:** members counted by body and by designation, with a
  "Not set" line for members without one.
* **Admin notes:** a private note on each application (Application details, Admin notes).
  Stored in `membership_applications.admin_notes`.
* **Activity log:** the latest 300 changes to members, applications, groups and
  positions, with who made each change and when. Entries are written by database
  triggers, so they can't be skipped. Admins only.
* **CSV export:** members (including body and designation), plus applications by status.

## If the sign-in page does not appear

1. Open `https://yantrika.in/admin.js`. You should see JavaScript code. A 404 means the
   file is not on the live site.
2. Scroll to the bottom of `https://yantrika.in`. You should see **Admin login**.
   If not, the new `sitemap.js` is not live.
3. Open `https://yantrika.in/#/admin` and press Ctrl+F5. You should see Admin sign-in.
4. If the page is blank or shows an error, press F12, open the Console tab, and send
   the red messages.

## Verified before release

* The migration runs on PostgreSQL, and running it a second time also succeeds.
* Anonymous visitors cannot read members, applications or the activity log.
* Non-admins cannot approve, edit or read members.
* Approval creates the member and marks the application in one step, and a
  failed approval changes nothing.
* A duplicate email or Member ID is refused by the database.
* Renaming a group or position updates the members who have it.

## Sign-in is not remembered

The admin page keeps the login in memory only. Nothing is saved in the browser,
so you sign in again on every visit and after every reload. Signing out clears
any leftover saved login. The public website does not use logins and is not affected.

## Adding a member

In All Members, click **+ Add member**. The Member ID is generated automatically
(see below). Enter the name and affiliation (required). The joined date defaults to
today and the status to Active. The database refuses an email that already exists.

**Member ID rule:** the next ID follows the most recent ID's prefix and width. For
example, if the highest ID is `YTK-010`, the next is `YTK-011`. With no members, the
first is `YTK-001`. If your IDs follow a different pattern, tell the club admin and
the function can be changed.

**If you see "The database rejected a value":** the message names the database rule
that blocked the save. To list the rules on the members table, run:

```sql
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.members'::regclass and contype = 'c';
```

## Affiliation

The database only accepts certain affiliation values (`members_affiliation_check`).
The dashboard offers them as a dropdown: **IACS** or **Non-IACS**. To see the exact rule, run:

```sql
select pg_get_constraintdef(oid)
from pg_constraint
where conname = 'members_affiliation_check';
```
