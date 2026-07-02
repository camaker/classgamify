---
title: Assignment links for teachers who do not want another LMS
description: Why public student links need snapshots, limits, timers, and safe answer reveal instead of a heavy course system.
date: 2026-07-02
category: Assignments
image: https://classgamify.com/og.png
---

Many teachers do not need another learning management system just to send a
ten-minute review activity. They need a link that opens quickly, works on
student devices, and reports back enough information to guide the next lesson.

That is the assignment model ClassGamify is building toward.

## A link should be simple for students

The student experience should not start with account setup. For many classroom
and tutoring workflows, the useful path is:

1. The teacher publishes an activity.
2. The app creates a share link.
3. Students open the runner.
4. Students enter a name only if the teacher asks for it.
5. The app records the attempt and shows feedback when allowed.

Anonymous assignment links can still enforce attempt limits with a browser
token. That lets a teacher avoid collecting names for quick practice while still
keeping the homework from being submitted repeatedly by accident.

The runner should also explain the rules before students start: item count,
attempt limit, timer, close time, identity mode, and whether review feedback can
appear after submission. That rule summary belongs in the public assignment
payload, but answer keys and teacher-only notes do not.

## Snapshots protect already-shared homework

Teachers edit activities all the time. They fix a typo, add an explanation, or
prepare a harder version for another class. Those edits should not rewrite an
assignment that has already been sent.

ClassGamify publishes assignments from snapshots. A snapshot freezes the
student-facing content and settings for that link. The activity library remains
editable, but the assignment remains stable.

Closed or expired links should respect the same boundary. They can tell students
that the assignment is unavailable and to contact the teacher, but they should
not expose the frozen runtime items after access is no longer allowed.

## Settings belong on the assignment

The same activity may be used differently across classes. One group might need
student names and answer reveal. Another might need anonymous practice, shuffled
items, a short timer, and a close-after date.

Those choices belong to the assignment, not the activity. That separation keeps
the reusable content clean and makes each share link intentional.

## Correct answers are a trust boundary

Student runners should receive prompts and choices, not the full answer key.
Correct answers, accepted alternatives, and explanations should appear only
after scoring and only when the assignment settings allow it.

That is the difference between a convenient public link and a link that leaks
the homework.
