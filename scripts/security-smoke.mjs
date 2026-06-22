import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function file(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

const auth = file('lib/auth.ts')
assert.match(auth, /metadata\?\.role === 'admin'/)
assert.match(auth, /metadata\?\.is_admin === true/)
assert.doesNotMatch(auth, /metadata\?\.admin/)
assert.doesNotMatch(auth, /metadata\?\.roles/)

const verifyRoute = file('app/api/razorpay/verify/route.ts')
assert.match(verifyRoute, /verifyRazorpaySignature/)
assert.match(verifyRoute, /payment_status: 'pending'/)
assert.doesNotMatch(verifyRoute, /payment_status:\s*'paid'/)

const webhookRoute = file('app/api/razorpay/webhook/route.ts')
assert.match(webhookRoute, /x-razorpay-signature/)
assert.match(webhookRoute, /x-razorpay-event-id/)
assert.match(webhookRoute, /readTextBody/)
assert.match(webhookRoute, /payment_events/)
assert.match(webhookRoute, /amountPaid !== null && amountPaid === expectedAmount/)

const schema = file('supabase-schema.sql')
assert.match(schema, /create table if not exists public\.payment_events/)
assert.match(schema, /unique \(provider, event_id\)/)
assert.match(schema, /jsonb_array_length\(items\) > 0/)
assert.doesNotMatch(schema, /app_metadata' ->> 'is_admin', 'false'\) = 'true'/)

console.log('Security smoke checks passed')
