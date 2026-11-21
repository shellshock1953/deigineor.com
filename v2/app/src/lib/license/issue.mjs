// Copied from deigineor/VST-DEV tools/license/issue.mjs @ 81a7a54 (file last changed in ef27c39). Keep the code below byte-identical:
// its output must match the Librarium Studio verifier. To update, re-copy the file and re-run `pnpm test`.
// Node reference issuer: the same licence file as `librarium-license issue`, using only node:crypto (Ed25519 is built in).
// This is what a route handler on deigineor.com contains, after it verified the Paddle-Signature header and fetched
// the customer (name + email) from the Paddle Customers API: a transaction.completed event carries only customer_id.
//   node tools/license/issue.mjs <secret.key (hex seed)> <transaction.completed.json> <customer.json> [out.lic] [entitlement]
// Byte-identical to the C++ tool: JSON.stringify keeps key order and writes no spaces, like Json::dump(false).
import { createPrivateKey, sign } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const PKCS8_ED25519_PREFIX = '302e020100300506032b657004220420';   // wrapper around the 32-byte seed

function privateKey(seedHex) {
  return createPrivateKey({ key: Buffer.concat([Buffer.from(PKCS8_ED25519_PREFIX, 'hex'), Buffer.from(seedHex, 'hex')]), format: 'der', type: 'pkcs8' });
}

function signed(format, payload, seedHex) {
  const signature = sign(null, Buffer.from(payload), privateKey(seedHex)).toString('hex');
  return JSON.stringify({ format, version: 1, payload, signature }) + '\n';
}

// entitlement: 'librarium-studio' now; a per-library licence later is the same file with 'lib:<id>'
export function issueLicense(seedHex, event, customer, entitlement = 'librarium-studio', maxMajor = 0) {
  const d = event.data;
  if (event.event_type !== 'transaction.completed' || d.status !== 'completed' || !d.id.startsWith('txn_')) throw new Error('not a completed transaction');
  const { name, email } = customer.data;
  if (!name || !email) throw new Error('customer has no name/email');
  const payload = JSON.stringify({
    product: entitlement, name, email, txn: d.id, issued_at: d.billed_at ?? event.occurred_at, ...(maxMajor ? { max_major: maxMajor } : {}),
  });
  return signed('librarium-license', payload, seedHex);
}

// Refund/chargeback handling (adjustment.created AND adjustment.updated): returns the txn to add to revoked.json, or null to ignore.
export function revocationFor(event) {
  const d = event.data;
  if (!['adjustment.created', 'adjustment.updated'].includes(event.event_type)) return null;
  if (d.status !== 'approved' || !['refund', 'chargeback'].includes(d.action) || d.type === 'partial') return null;
  return d.transaction_id?.startsWith('txn_') ? d.transaction_id : null;
}

export function revocationList(seedHex, issuedAt, entries) {
  const payload = JSON.stringify({ product: 'librarium', issued_at: issuedAt, revoked: entries });   // entries: [{txn, action, adj, at}]
  return signed('librarium-revoked', payload, seedHex);
}

if (process.argv[1]?.endsWith('issue.mjs')) {
  const [, , keyFile, hook, cust, out = 'Librarium.lic', entitlement = 'librarium-studio'] = process.argv;
  writeFileSync(out, issueLicense(readFileSync(keyFile, 'utf8').trim(), JSON.parse(readFileSync(hook, 'utf8')), JSON.parse(readFileSync(cust, 'utf8')), entitlement));
  console.log('wrote', out);
}
