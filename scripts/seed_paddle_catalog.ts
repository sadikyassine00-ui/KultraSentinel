import fs from 'fs';
import path from 'path';
import { Environment, Paddle, type CurrencyCode } from '@paddle/paddle-node-sdk';
import { PADDLE_PLANS, getPaddleEnvironment } from '../src/lib/paddle/config';

function loadEnvFile() {
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
loadEnvFile();

async function seedCatalog() {
  const apiKey = (process.env.PADDLE_API_KEY || process.env.PADDLE_SANDBOX_API_KEY)?.trim();
  const envType = getPaddleEnvironment();

  console.log('----------------------------------------------------');
  console.log(' Kultra Paddle Sandbox Catalog Provisioning');
  console.log('----------------------------------------------------');
  console.log(`Target Environment: ${envType}`);

  if (!apiKey) {
    console.warn('\n[Notice] PADDLE_API_KEY is not set in environment variables.');
    console.log('Here is the exact catalog specification ready for provisioning:\n');
    console.log(JSON.stringify({
      solo: {
        product: {
          name: PADDLE_PLANS.solo.name,
          taxCategory: PADDLE_PLANS.solo.taxCategory,
          description: PADDLE_PLANS.solo.description,
        },
        price: {
          description: 'Kultra Solo Monthly USD ($19/mo)',
          unitPrice: { amount: PADDLE_PLANS.solo.unitAmount, currencyCode: PADDLE_PLANS.solo.currencyCode },
          billingCycle: { interval: PADDLE_PLANS.solo.billingInterval, frequency: PADDLE_PLANS.solo.billingFrequency },
          trialPeriod: { interval: 'day', frequency: 14 },
        },
      },
      agency: {
        product: {
          name: PADDLE_PLANS.agency.name,
          taxCategory: PADDLE_PLANS.agency.taxCategory,
          description: PADDLE_PLANS.agency.description,
        },
        price: {
          description: 'Kultra Agency Monthly USD ($49/mo)',
          unitPrice: { amount: PADDLE_PLANS.agency.unitAmount, currencyCode: PADDLE_PLANS.agency.currencyCode },
          billingCycle: { interval: PADDLE_PLANS.agency.billingInterval, frequency: PADDLE_PLANS.agency.billingFrequency },
        },
      },
    }, null, 2));

    console.log('\nTo execute live provisioning, provide PADDLE_API_KEY and run:');
    console.log('npx tsx scripts/seed_paddle_catalog.ts\n');
    return;
  }

  const paddle = new Paddle(apiKey, {
    environment: envType === 'production' ? Environment.production : Environment.sandbox,
  });

  console.log('\nScanning existing products in Paddle sandbox catalog...');
  let soloProduct: any = null;
  let soloPrice: any = null;
  let agencyProduct: any = null;
  let agencyPrice: any = null;

  try {
    const productCollection = paddle.products.list({ include: ['prices'] });
    for await (const p of productCollection) {
      if (p.name === PADDLE_PLANS.solo.name) {
        soloProduct = p;
        if (p.prices && p.prices.length > 0) {
          soloPrice = p.prices[0];
        }
      } else if (p.name === PADDLE_PLANS.agency.name) {
        agencyProduct = p;
        if (p.prices && p.prices.length > 0) {
          agencyPrice = p.prices[0];
        }
      }
    }
  } catch (err) {
    console.warn('Note: Could not inspect existing products, will create directly:', err);
  }

  // 1. Solo Product & Price
  if (soloProduct) {
    console.log(`\n1. Found Existing Product: Kultra Solo (${soloProduct.id})`);
  } else {
    console.log('\n1. Creating Product: Kultra Solo ($19/mo)...');
    soloProduct = await paddle.products.create({
      name: PADDLE_PLANS.solo.name,
      taxCategory: PADDLE_PLANS.solo.taxCategory,
      description: PADDLE_PLANS.solo.description,
    });
    console.log(`   Product Created: ${soloProduct.id}`);
  }

  if (soloPrice) {
    console.log(`   Found Existing Price for Solo: ${soloPrice.id}`);
  } else {
    soloPrice = await paddle.prices.create({
      productId: soloProduct.id,
      description: 'Kultra Solo Monthly USD ($19/mo) - Immediate Billing',
      unitPrice: { amount: PADDLE_PLANS.solo.unitAmount, currencyCode: PADDLE_PLANS.solo.currencyCode as CurrencyCode },
      billingCycle: { interval: PADDLE_PLANS.solo.billingInterval, frequency: PADDLE_PLANS.solo.billingFrequency },
    });
    console.log(`   Price Created: ${soloPrice.id} ($19/mo USD immediate billing)`);
  }

  // 2. Agency Product & Price
  if (agencyProduct) {
    console.log(`\n2. Found Existing Product: Kultra Agency (${agencyProduct.id})`);
  } else {
    console.log('\n2. Creating Product: Kultra Agency ($49/mo)...');
    agencyProduct = await paddle.products.create({
      name: PADDLE_PLANS.agency.name,
      taxCategory: PADDLE_PLANS.agency.taxCategory,
      description: PADDLE_PLANS.agency.description,
    });
    console.log(`   Product Created: ${agencyProduct.id}`);
  }

  if (agencyPrice) {
    console.log(`   Found Existing Price for Agency: ${agencyPrice.id}`);
  } else {
    agencyPrice = await paddle.prices.create({
      productId: agencyProduct.id,
      description: 'Kultra Agency Monthly USD ($49/mo)',
      unitPrice: { amount: PADDLE_PLANS.agency.unitAmount, currencyCode: PADDLE_PLANS.agency.currencyCode as CurrencyCode },
      billingCycle: { interval: PADDLE_PLANS.agency.billingInterval, frequency: PADDLE_PLANS.agency.billingFrequency },
    });
    console.log(`   Price Created: ${agencyPrice.id} ($49/mo USD)`);
  }

  console.log('\n----------------------------------------------------');
  console.log(' Catalog Provisioning Complete!');
  console.log(' Add these variables to your .env.local:');
  console.log('----------------------------------------------------');
  console.log(`NEXT_PUBLIC_PADDLE_SOLO_PRICE_ID=${soloPrice.id}`);
  console.log(`NEXT_PUBLIC_PADDLE_AGENCY_PRICE_ID=${agencyPrice.id}`);
  console.log('----------------------------------------------------\n');
}

seedCatalog().catch((err) => {
  console.error('[Paddle Catalog Seed Error]:', err);
  process.exit(1);
});
