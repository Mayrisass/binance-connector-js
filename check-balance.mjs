// Read-only Binance balance check. Run on YOUR computer (Node 18+), not in the cloud.
//
//   Mac/Linux:  BINANCE_API_KEY=xxx BINANCE_API_SECRET=yyy node check-balance.mjs
//   Windows PowerShell:
//     $env:BINANCE_API_KEY="xxx"; $env:BINANCE_API_SECRET="yyy"; node check-balance.mjs
//
// No dependencies. The secret never leaves your computer; only the signature is sent.
import { createHmac } from 'node:crypto';

const key = process.env.BINANCE_API_KEY;
const secret = process.env.BINANCE_API_SECRET;
if (!key || !secret) {
    console.error('Set BINANCE_API_KEY and BINANCE_API_SECRET first.');
    process.exit(1);
}

const query = `timestamp=${Date.now()}&recvWindow=10000`;
const signature = createHmac('sha256', secret).update(query).digest('hex');

const res = await fetch(`https://api.binance.com/api/v3/account?${query}&signature=${signature}`, {
    headers: { 'X-MBX-APIKEY': key },
});
const data = await res.json();

if (!res.ok) {
    console.error(`Error ${res.status}:`, data);
    process.exit(1);
}

const balances = data.balances.filter((b) => Number(b.free) + Number(b.locked) > 0);
console.log(balances.length ? 'Your balances:' : 'Connected. No balances found.');
for (const b of balances) console.log(`${b.asset}: free ${b.free}, locked ${b.locked}`);
