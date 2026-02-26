-- Mark all active songs as purchasable in the Music Market
-- Songs remain streamable free on Tanty Radio — is_premium only enables the "Unlock $0.99" button
-- Run this after songs are seeded via seed-radio or admin panel

UPDATE public.songs
SET metadata = metadata || '{"is_premium": true, "price": 0.99}'::jsonb
WHERE is_active = true;
