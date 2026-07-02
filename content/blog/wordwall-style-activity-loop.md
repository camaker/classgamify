---
title: Designing the Wordwall-style activity loop
description: How ClassGamify separates reusable teacher content, game templates, assignment links, and result review.
date: 2026-07-02
category: Templates
image: https://classgamify.com/og.png
---

The important lesson from Wordwall is not just that activities feel playful. The
real product loop is that one teacher-owned set of lesson material can become
several classroom experiences without being rewritten every time.

ClassGamify is built around that loop:

1. Create a reusable activity.
2. Pick a template that fits the lesson.
3. Publish an assignment link.
4. Let students play or complete the worksheet-style runner.
5. Review results and decide what to reteach.

That structure keeps the product useful for daily classroom work instead of
becoming a collection of disconnected mini-games.

## Content comes before the game

An activity stores the teacher's lesson material: vocabulary, questions,
answers, explanations, pairs, categories, notes, and instructions. The template
decides how that material is presented.

Source materials can support that activity without becoming a second public
data model. A teacher might attach audio, a worksheet image, a document, or a
spreadsheet for editing and future extraction. Student links should still
receive only the runtime prompts, choices, and instructions needed for the
assignment, not teacher file lists or storage metadata.

This matters because a teacher might start with a quiz, then reuse the same
content as a match-up activity, a group sort, or a fill-in worksheet. The
content should not be trapped inside one game mode.

## Templates should be honest about readiness

Not every activity can become every template immediately. A quiz may only need
questions and answers. A match-up needs pairs. A group sort needs categories and
items. A listening activity needs prompts and either a transcript or expected
answer.

ClassGamify treats this as a readiness problem. The app can show which
templates are already playable and which need more structured content. That is
also the foundation for AI remixing later: the AI should fill missing fields
that the readiness model can already describe.

## Student links are delivery, not content editing

Publishing creates an assignment snapshot. That snapshot freezes the title,
template, settings, and activity content for the shared link. If the teacher
edits the original activity next week, the homework already sent to students
does not silently change.

That is a boring detail in the best possible way. Teachers need links they can
trust.

## Results close the loop

A game-like runner is only half the job. The teacher also needs to know what
happened: which students completed the work, which items had low correct rates,
which answers were close, and which explanation should be repeated tomorrow.

That means results, exports, copied classroom briefs, and follow-up summaries
belong to the same loop as the template itself. They should be based on the
assignment snapshot and scored attempts so the teacher can trust the evidence
after the class has moved on.

The loop is not "make a fun activity." The loop is "teach, assign, observe,
reteach." That is the product ClassGamify is being shaped around.
