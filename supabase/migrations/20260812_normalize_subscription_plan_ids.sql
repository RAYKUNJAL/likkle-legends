-- Normalize subscriptions.plan_id to canonical plan_* values understood by
-- lib/feature-access.ts. Fixes rows written as raw PayPal P-... IDs or short names.

-- Short / legacy names → plan_*
UPDATE public.subscriptions
SET plan_id = 'plan_digital_legends'
WHERE plan_id IN ('digital_legends', 'digital_explorer');

UPDATE public.subscriptions
SET plan_id = 'plan_mail_intro'
WHERE plan_id IN ('starter_mailer', 'mail_intro');

UPDATE public.subscriptions
SET plan_id = 'plan_legends_plus'
WHERE plan_id = 'legends_plus';

UPDATE public.subscriptions
SET plan_id = 'plan_family_legacy'
WHERE plan_id = 'family_legacy';

UPDATE public.subscriptions
SET plan_id = 'plan_free_forever'
WHERE plan_id IN ('free', 'plan_free');

-- Known historical PayPal plan IDs → plan_*
UPDATE public.subscriptions
SET plan_id = 'plan_digital_legends'
WHERE plan_id = 'P-0LU582199P7741420NGQA4JI';

UPDATE public.subscriptions
SET plan_id = 'plan_mail_intro'
WHERE plan_id IN (
    'P-9Y7503296X038324YNGN72CI',
    'P-1R150232CG183332XNFLNNBQ',
    'P-0YY72736T56573355NFLOZZQ'
);

UPDATE public.subscriptions
SET plan_id = 'plan_legends_plus'
WHERE plan_id IN (
    'P-45M32159VV6033601NFLOOYI',
    'P-2503312149524980NNFLO34Y'
);

UPDATE public.subscriptions
SET plan_id = 'plan_family_legacy'
WHERE plan_id IN (
    'P-9MP32022V70125639NFLT4IA',
    'P-4G842008M1421443UNFLO3MY',
    'P-5U054702T9664311ANFLO53A',
    'P-5U054702T9664311ANFLO53'
);

-- Env-configured plan IDs that may already be stored raw are remapped at
-- write-time by lib/normalize-plan-id.ts. For leftover unknown P-% rows,
-- review manually:
--   SELECT DISTINCT plan_id FROM public.subscriptions WHERE plan_id LIKE 'P-%';
