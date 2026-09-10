---
name: write-user-docs
description: >-
  Write or revise user-facing documentation in the voice of an experienced human technical
  writer, not an AI assistant: task-oriented, direct, concrete, no filler or hype words. Use
  whenever creating or editing end-user docs — a documentation page, guide, README section,
  help text, or release note a user will read. Argument ($ARGUMENTS): optional
  doc file or section to write/revise; defaults to the user-facing surface of the current change.
---

# write-user-docs

Write user documentation the way an experienced human technical writer would: a knowledgeable
colleague showing another person how to use the product — direct, specific, unpadded.

Use this when producing anything a **user** reads: documentation pages, README sections, help
text, release notes, changelog entries, error-message copy. Do **not** apply this voice to
internal/agent docs (`CLAUDE.md`), code comments, or commit messages —
those have their own conventions.

## Audience and framing

- Write for a user trying to get something done, not a reader who wants an essay. Lead with the
  task or the answer, not background.
- **Lead with the capability or outcome, not the implementation.** This is end-user
  documentation, not a technical record of what changed internally. Write from the user's point
  of view: what can they now do, what has changed about their experience, what do they need to
  know. Prefer _"It is now possible to skip specific steps when starting a change"_ over _"A new
  `skip_steps` field is available on the change resource"_.
- **Keep internal detail out of the subject position.** Internal model names, database columns,
  serializer attributes and API field names can appear as supporting detail, but the
  user-visible behaviour comes first. Do not narrate internal engineering decisions, the
  reasoning behind them, or problems encountered during development — document how to use the
  product, not how it was built or why.
- Use task-oriented headings that name the goal: "Reset your password," not "Password Reset
  Overview" or "Understanding Password Resets."
- Address the reader as "you." Use imperatives for steps: "Click Save," not "You'll want to
  click Save" or "The user can click Save."

Leading with the capability, and keeping internal detail out of the subject position, are also
summarised in the writing style section of `CLAUDE.md`. That overlap is deliberate: `CLAUDE.md`
is always loaded, whereas this skill is only read once invoked, and leading with implementation
detail is the mistake made most often. Keep the two in step rather than de-duplicating them.

## Cut the AI tells

- No filler intros: "In this article we'll walk you through," "This guide covers," "Let's get
  started." Start with the content.
- Ban hype words: simply, just, easily, seamlessly, effortlessly, quickly, powerful, robust,
  intuitive, unlock, streamline. If a step is easy, the reader finds out by doing it.
- Drop throat-clearing: "It's worth noting that," "Please note," "Keep in mind." State it
  directly.
- No summary paragraph that restates the article ("In summary," "As we've covered"). Stop when
  the instructions end.
- Avoid the rule-of-three cadence ("fast, simple, and secure") and "not only… but also"
  constructions.

## Tone

- Don't narrate the reader's feelings ("You'll love this," "Don't worry"). Don't over-reassure.
- Be concrete: name the actual button, menu, field, or error text. "If you see 'Invalid
  token,'…" beats "if an error occurs."
- Vary sentence length. Short sentences are fine.
- State limits and caveats plainly instead of softening them into vagueness. If a feature
  doesn't work on mobile, say so.
- Assume the reader is competent. Don't explain the obvious or repeat yourself.

## Banned words & phrases (quick scan before shipping)

- **Hype adverbs/adjectives:** simply, just, easily, seamlessly, effortlessly, quickly,
  powerful, robust, intuitive, unlock, streamline.
- **Filler intros:** "in this article/guide/section," "we'll walk you through," "let's get
  started," "read on."
- **Throat-clearing:** "it's worth noting," "please note," "keep in mind," "as you can see."
- **Wrap-ups:** "in summary," "in conclusion," "as we've covered."
- **Cadences:** rule-of-three lists of adjectives; "not only… but also."
- **Feelings/reassurance:** "you'll love," "don't worry," "no need to stress."

If a sentence still reads fine after you delete one of these, it was padding — leave it out.

## Before → after

- Intro:
  - ❌ "In this guide, we'll walk you through how to easily create your first change."
  - ✅ "Create a change to run an action against an asset:"
- Hype:
  - ❌ "The powerful `--wait` flag seamlessly streams status so you can effortlessly track
    progress."
  - ✅ "`--wait` polls every created change and prints its status until it finishes."
- Vague caveat → specific:
  - ❌ "Note that some options may not be available in every context."
  - ✅ "`--template-version` is ignored for asset-scoped changes; the asset's own template
    version is used."
- Error handling:
  - ❌ "If something goes wrong, an error will be shown."
  - ✅ "If the asset doesn't exist in the environment, the row shows `not found in project
    '<code>' environment '<env>'` and is skipped."
