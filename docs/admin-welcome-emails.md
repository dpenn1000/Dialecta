# Admin Welcome Emails

Templates for inviting new members into Dialecta's admin circle.

Voice: thoughtful, careful, slightly elevated. Periodical register. Not
corporate, not effusive. The invitation should land as meaningful, not
casual.

Two templates below: a Tom-specific draft (ready to send the moment Tom
signs up at dialecta.org), and a generic template parameterized for
future admins.

---

## 1. For Tom Gaetani — first added admin

Send via your normal email account, after Tom has signed up at
dialecta.org and you've granted him the Reviewer role via /dev-admin/.

**Subject:** An invitation to the workshop, with thanks

```
Tom,

Your morning notes were the first piece of outside feedback Dialecta has
ever received. Genuine read, useful observations, generous tone. Thank
you for spending the time.

The note about the typing cursor on the sign-up form is filed and on the
bench. The thoughts on imagery and content density are filed too — these
go to the editorial conversation rather than the engineering one, and
they're useful even when the answer turns out to be "we're keeping the
register sparse on purpose." Most of all, the line about wanting readers
to engage in a deep, thoughtful way: you read the platform's intent
without me priming you. That landed.

I'd like to invite you in further.

I've added you as a Reviewer in Dialecta's working admin. That means you
can see and triage the feedback queue (yours included), watch the work
as it happens, and add notes of your own as you spot things. It's not a
job. It's a small inner circle of trusted readers helping shape what
this becomes.

To get in:

  1. Sign in at https://dialecta.org with the same email you'd use as a
     reader. You'll see your member profile.
  2. Open the hamburger menu — there's now a small "Admin" row at the
     bottom with a "Dev Admin" pill.
  3. That takes you to /dev-admin/, where the Feedback tab will already
     have your morning notes loaded as the first six items.

If you don't see admin access after signing in, ping me — the role
grant might not have propagated yet.

More to come. Thanks again for the read.

— Daniel
```

---

## 2. Generic template — future invited admins

For inviting people into Publisher / Editor / Curator / Reviewer roles
once Tom is in and the pattern is set. Replace `{{NAME}}`, `{{ROLE}}`,
and `{{ROLE_DESCRIPTION}}` before sending.

**Subject:** An invitation to Dialecta's workshop

```
{{NAME}},

I'd like to invite you into Dialecta's working circle.

Dialecta is a publication for thoughtful, careful conversation about
hard problems — in writing, with real time to read and respond. It's
invited-only at this stage and being built as we go. I'm gathering a
small group of trusted readers and contributors to help shape it.

I've added you as a {{ROLE}}. {{ROLE_DESCRIPTION}}

It's not a job. It's a small inner circle of trusted readers and
contributors helping shape what this becomes.

To get in:

  1. Sign in at https://dialecta.org. Your member profile lives at
     /profile/.
  2. Open the hamburger menu — at the bottom is a small "Admin" row
     with a "Dev Admin" pill.
  3. /dev-admin/ is the working room. Your role determines which
     sections you see.

If you don't see admin access right away, let me know and I'll check
the grant.

More to come. Thank you for being part of this.

— Daniel
```

### {{ROLE_DESCRIPTION}} options

Drop in the appropriate one based on the role you're granting:

- **Publisher**
  > That's the top of the masthead. You have full reach across every
  > admin domain — feedback triage, article tools, quote curation,
  > member management, platform tuning, and the ability to grant or
  > revoke admin roles for others.

- **Editor**
  > That's article and content admin. You can re-polish published work,
  > override AI tier classifications, and archive articles. You also
  > get light visibility into the member directory.

- **Curator**
  > That's the quote library — adding, editing, archiving quotes, and
  > reviewing member submissions for the curated pool that surfaces at
  > Dialecta's ritual moments (compose, reflection, posted, pact).

- **Reviewer**
  > That's the feedback queue. You read incoming notes from other
  > members and visitors, set their priority, and decide what to do
  > with each one. Nothing gets dismissed without your review.

---

## Notes

- Send from a personal address, not a `noreply@`. The invitation should
  feel like a conversation, not a system notification.
- Don't bcc anyone. If you're inviting two people in the same week, send
  two separate emails.
- The invitation does NOT need to reveal the role hierarchy in detail;
  the {{ROLE_DESCRIPTION}} is enough. People can discover the rest by
  using the dashboard.
- For non-Tom invitations, consider attaching one or two recent
  Dialecta articles the recipient might enjoy, as a way of saying "this
  is the kind of work we're trying to support."
- After sending, grant the role via /dev-admin/ → Team → "+ Grant New
  Role" before the recipient signs up. That way it activates the moment
  their profile lazy-creates on first /profile/ visit.
