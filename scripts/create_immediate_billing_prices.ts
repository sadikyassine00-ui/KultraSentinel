import { Environment, Paddle, type CurrencyCode } from '@paddle/paddle-node-sdk';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

async function main() {
  const apiKey = (process.env.PADDLE_API_KEY || process.env.PADDLE_SANDBOX_API_KEY)?.trim();
  if (!apiKey) {
    throw new Error('PADDLE_API_KEY is not configured in .env');
  }

  const paddle = new Paddle(apiKey, { environment: Environment.sandbox });

  console.log('Fetching products from Paddle sandbox...');
  let soloProduct: any = null;
  let agencyProduct: any = null;

  for await (const product of paddle.products.list({ include: ['prices'] })) {
    if (product.name === 'Kultra Solo') {
      soloProduct = product;
    } else if (product.name === 'Kultra Agency') {
      agencyProduct = product;
    }
  }

  if (!soloProduct) {
    throw new Error('Kultra Solo product not found in Paddle catalog.');
  }

  console.log(`Found Kultra Solo product: ${soloProduct.id}`);
  console.log('Existing prices on Kultra Solo:');
  for (const price of soloProduct.prices || []) {
    console.log(`- ${price.id}: ${price.description}, trial_period:`, price.trialPeriod);
  }

  console.log('\nCreating new IMMEDIATE BILLING price for Kultra Solo (ZERO trial period)...');
  const newSoloPrice = await paddle.prices.create({
    productId: soloProduct.id,
    description: 'Kultra Solo Monthly ($19/mo) - Immediate Billing',
    unitPrice: {
      amount: '1900',
      currencyCode: 'USD' as CurrencyCode,
    },
    billingCycle: {
      interval: 'month',
      frequency: 1,
    },
    // Explicitly NO trialPeriod!
  });

  console.log(`\n>>> SUCCESS! Created New Immediate Billing Solo Price: ${newSoloPrice.id}`);
  console.log('Trial Period on new price:', newSoloPrice.trialPeriod);

  if (agencyProduct) {
    console.log(`\nFound Kultra Agency product: ${agencyProduct.id}`);
    console.log('Existing prices on Kultra Agency:');
    for (const price of agencyProduct.prices || []) {
      console.log(`- ${price.id}: ${price.description}, trial_period:`, price.trialPeriod);
    }
  }
}

main().catch((err) => {
  console.error('[Error]:', err);
  process.exit(1);
});
