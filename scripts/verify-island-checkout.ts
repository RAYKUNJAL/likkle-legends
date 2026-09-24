/**
 * Fail-closed checks for Island Pack / Family Plan checkout.
 * Does not call PayPal and does not unlock anything.
 */
import {
    FAMILY_PLAN_ANNUAL,
    ISLAND_PACK_10,
    ISLAND_PACK_25,
    ISLAND_PASS_ANNUAL,
    KID_IAP_PRODUCT_IDS,
    PARENT_OFFERS,
    decideOneTimeGrant,
    decideSaleGrant,
    decideSubscriptionGrant,
    isChildRoute,
    isParentPayerRole,
    resolveSubscriptionPlanId,
} from '../lib/paypal-offers';

function assert(condition: unknown, message: string) {
    if (!condition) throw new Error(message);
}

const pack10 = PARENT_OFFERS[ISLAND_PACK_10];
const pack25 = PARENT_OFFERS[ISLAND_PACK_25];
const islandPass = PARENT_OFFERS[ISLAND_PASS_ANNUAL];
const familyPlan = PARENT_OFFERS[FAMILY_PLAN_ANNUAL];

assert(pack10.price === 10 && pack10.kind === 'one_time', 'island pack 10 price');
assert(pack25.price === 25 && pack25.kind === 'one_time', 'island pack 25 price');
assert(islandPass.kind === 'subscription' && islandPass.interval === 'year', 'island pass annual');
assert(familyPlan.kind === 'subscription' && familyPlan.price === 349, 'family plan annual price');
assert(pack10.entitlementTier === 'plan_mail_intro', 'starter entitlement');
assert(pack25.entitlementTier === 'plan_legends_plus', 'discovery entitlement');
assert(islandPass.entitlementTier === 'plan_digital_legends', 'island pass tier');
assert(familyPlan.entitlementTier === 'plan_family_legacy', 'family tier');

assert(isChildRoute('/portal'), 'portal is a child route');
assert(isChildRoute('/portal/games'), 'portal game is a child route');
assert(!isChildRoute('/checkout'), 'checkout is a parent route');
assert(!isChildRoute('/parent'), 'parent dashboard is not a child route');
assert(isParentPayerRole('parent') && isParentPayerRole('grandparent'), 'parents can pay');
assert(!isParentPayerRole('teacher') && !isParentPayerRole('') && !isParentPayerRole(null), 'non-parents cannot pay');
assert(KID_IAP_PRODUCT_IDS.has('streak_freeze'), 'streak freeze is kid IAP');

const buyer = '11111111-1111-1111-1111-111111111111';
const customId = `${buyer}:${ISLAND_PACK_10}`;
assert(decideOneTimeGrant({
    offer: pack10,
    captureStatus: 'COMPLETED',
    capturedAmount: 10,
    currency: 'USD',
    customId,
    buyerUserId: buyer,
}).ok, 'verified $10 capture grants');

assert(!decideOneTimeGrant({
    offer: pack10,
    captureStatus: 'COMPLETED',
    capturedAmount: 0.01,
    currency: 'USD',
    customId,
    buyerUserId: buyer,
}).ok, 'amount mismatch does not grant');

assert(!decideOneTimeGrant({
    offer: pack10,
    captureStatus: 'PENDING',
    capturedAmount: 10,
    currency: 'USD',
    customId,
    buyerUserId: buyer,
}).ok, 'pending capture does not grant');

assert(!decideOneTimeGrant({
    offer: pack10,
    captureStatus: 'COMPLETED',
    capturedAmount: 10,
    currency: 'USD',
    customId,
    buyerUserId: 'someone-else',
}).ok, 'buyer mismatch does not grant');

assert(resolveSubscriptionPlanId(familyPlan, {}) === null, 'missing family plan id fails closed');
assert(resolveSubscriptionPlanId(familyPlan, {
    NEXT_PUBLIC_PAYPAL_PLAN_FAMILY_YEARLY: 'P-FAMILY-YEAR',
}) === 'P-FAMILY-YEAR', 'family yearly env resolves');

assert(!decideSubscriptionGrant({
    offer: familyPlan,
    status: 'ACTIVE',
    paypalPlanId: 'P-OTHER',
    expectedPlanId: 'P-FAMILY-YEAR',
    customId: `${buyer}:${FAMILY_PLAN_ANNUAL}`,
    buyerUserId: buyer,
}).ok, 'wrong plan id does not grant');

assert(!decideSubscriptionGrant({
    offer: familyPlan,
    status: 'APPROVED',
    paypalPlanId: 'P-FAMILY-YEAR',
    expectedPlanId: 'P-FAMILY-YEAR',
    customId: `${buyer}:${FAMILY_PLAN_ANNUAL}`,
    buyerUserId: buyer,
}).ok, 'approved-but-not-active does not grant');

assert(decideSubscriptionGrant({
    offer: islandPass,
    status: 'ACTIVE',
    paypalPlanId: 'P-PASS-YEAR',
    expectedPlanId: 'P-PASS-YEAR',
    customId: `${buyer}:${ISLAND_PASS_ANNUAL}`,
    buyerUserId: buyer,
}).ok, 'active matching plan grants');

assert(decideSaleGrant({
    offer: pack25,
    saleState: 'completed',
    amount: 25,
    currency: 'USD',
    customId: `${buyer}:${ISLAND_PACK_25}`,
    buyerUserId: buyer,
    billingAgreementId: null,
}).ok, 'completed $25 sale grants');

assert(!decideSaleGrant({
    offer: pack10,
    saleState: 'completed',
    amount: 10,
    currency: 'USD',
    customId,
    buyerUserId: buyer,
    billingAgreementId: 'I-SUBSCRIPTION',
}).ok, 'subscription sale does not grant a pack');

assert(!decideSaleGrant({
    offer: pack25,
    saleState: 'completed',
    amount: 9.99,
    currency: 'USD',
    customId: `${buyer}:${ISLAND_PACK_25}`,
    buyerUserId: buyer,
}).ok, 'sale amount mismatch does not grant');

assert(!decideSaleGrant({
    offer: pack10,
    saleState: 'pending',
    amount: 10,
    currency: 'USD',
    customId,
    buyerUserId: buyer,
}).ok, 'pending sale does not grant');

console.log('Island checkout fail-closed checks passed.');
