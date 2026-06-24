-- ============================================================================
-- PCOS App — Module 7: starter article seed (English)
-- Run AFTER 0001 (categories) in the Supabase SQL Editor.
-- ============================================================================
-- Educational content only: plain-language, non-prescriptive, body-positive,
-- evidence-based. Every article ends with a "not medical advice" line.
-- Bodies use a small markdown subset (## headings, - bullets, **bold**, *italic*).
-- Idempotent via ON CONFLICT (slug).
-- ============================================================================

insert into public.content_articles (slug, title, body, language, category_id, published, published_at)
values
(
  'what-is-pcos',
  'What is PCOS?',
  $md$## The short version
PCOS (polycystic ovary syndrome) is a common hormonal condition. Estimates suggest it affects roughly 1 in 10 women of reproductive age.

## Signs vary a lot
No two people experience it the same way. Common signs include:
- Irregular, very long, or missing periods
- Acne or oily skin
- Extra hair on the face or body, or thinning hair on the scalp
- Changes in weight

You can have PCOS with only some of these — and you do **not** need to have ovarian cysts to have it.

## It is not your fault
PCOS is driven by hormones and genetics, not by anything you did wrong.

## Diagnosis needs a clinician
Only a doctor can diagnose PCOS — usually by looking at your cycles, signs of higher androgens, and sometimes an ultrasound or blood tests. A questionnaire or app cannot diagnose it.

This is general information, not medical advice — see a clinician about your situation.$md$,
  'en',
  (select id from public.content_categories where slug = 'basics'),
  true,
  now()
),
(
  'why-tracking-helps',
  'Why tracking your cycle helps',
  $md$## What tracking shows
Logging your periods and how you feel can reveal patterns you might not notice day to day — like how long your cycles really are, or when certain symptoms tend to show up.

## Why it is useful
- It helps you describe your experience clearly to a doctor
- Patterns over a few months say more than any single day
- It can make irregular cycles easier to talk about

## An honest note
For irregular cycles, predictions are *estimates*, not promises. Tracking is a tool for understanding — it is not a diagnosis, and not a form of contraception.

This is general information, not medical advice — see a clinician about your situation.$md$,
  'en',
  (select id from public.content_categories where slug = 'basics'),
  true,
  now()
),
(
  'eating-well-with-pcos',
  'Eating well with PCOS',
  $md$## There is no single "PCOS diet"
Eating well is about balance and consistency, not strict rules or cutting out whole food groups.

## Gentle, practical ideas
- Build plates with fibre (vegetables, fruit, whole grains, beans) and protein
- Include healthy fats and stay hydrated
- Regular meals can help you feel steadier through the day

## Foods are not "good" or "bad"
All foods can fit. Crash diets and very restrictive eating tend to backfire and can harm your relationship with food. Be kind to yourself — your worth is **not** a number on a scale.

If food feels stressful, or you are considering big changes, a registered dietitian can help tailor things to you.

This is general information, not medical advice — see a clinician about your situation.$md$,
  'en',
  (select id from public.content_categories where slug = 'nutrition'),
  true,
  now()
),
(
  'movement-that-feels-good',
  'Movement that feels good',
  $md$## Any movement counts
You do not need an intense routine. Walking, dancing, cycling, swimming, yoga — what matters most is finding something you can enjoy and keep doing.

## A balanced mix
- Some strength work (bodyweight, bands, or weights) a couple of times a week
- Moderate cardio you actually like
- Rest days — recovery is part of the plan

## Movement for wellbeing
Think of movement as something that supports your energy, sleep, and mood — not a punishment or a way to "earn" food. Pushing to extremes can leave you more tired, not less.

This is general information, not medical advice — see a clinician about your situation.$md$,
  'en',
  (select id from public.content_categories where slug = 'movement'),
  true,
  now()
),
(
  'pcos-and-your-mood',
  'PCOS and your mood',
  $md$## You are not imagining it
Anxiety and low mood are more common with PCOS, and your feelings are valid. Hormones, uncertainty, and stigma can all play a part.

## Small things that can help
- Gentle routines for sleep, movement, and connection
- Talking to someone you trust
- Noticing what lifts you, and making a little room for it

## Reaching out is strength
If you are feeling persistently low, anxious, or overwhelmed, please talk to a clinician or a mental-health professional. If you ever feel unsafe or in crisis, contact a local helpline or emergency services right away.

This is general information, not medical advice — see a clinician about your situation.$md$,
  'en',
  (select id from public.content_categories where slug = 'mental_health'),
  true,
  now()
),
(
  'pcos-myths-busted',
  '5 PCOS myths, busted',
  $md$## Myth 1: "You must have ovarian cysts."
Not true. Despite the name, many people with PCOS do not have cysts — and having cysts alone does not mean you have PCOS.

## Myth 2: "Only women in larger bodies get PCOS."
PCOS affects people of every body size.

## Myth 3: "PCOS means you can never get pregnant."
PCOS can affect fertility, but many people with PCOS conceive — sometimes with support from a clinician.

## Myth 4: "Eating sugar causes PCOS."
PCOS is not caused by any single food. It involves hormones and genetics.

## Myth 5: "Losing weight cures PCOS."
There is no cure, and weight is not the whole story. Some people find certain changes help their symptoms, but PCOS is *managed*, not "fixed" — and care should be individual.

This is general information, not medical advice — see a clinician about your situation.$md$,
  'en',
  (select id from public.content_categories where slug = 'myths'),
  true,
  now()
)
on conflict (slug) do nothing;

-- ============================================================================
-- END
-- ============================================================================
