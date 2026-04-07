// OLD (broken — needed plan IDs that don't exist yet):
script.src = `...?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=subscription&vault=true`

// NEW (works immediately — no plan IDs needed):
script.src = `...?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`
