const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// 1. Read .env
const envFiles = ['.env', '.env.local'];
let databaseUrl = process.env.DATABASE_URL;

for (const file of envFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match && !databaseUrl) {
      databaseUrl = match[1];
    }
  }
}

if (!databaseUrl) {
  console.error('No DATABASE_URL found');
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;

async function verify() {
  console.log('--- Testing Live Telemetry Directive ---');
  const { getSuperTelemetry, recordDispatchLog, getDispatchLogs, getDb, ensureSchema } = await import('../src/lib/db.ts');

  await ensureSchema();

  console.log('\n1. Verifying Live Telemetry on Clean DB:');
  const telemetry = await getSuperTelemetry();
  console.log('Telemetry response:', telemetry);

  const asserts = [
    { label: 'MRR is 0 ($0.00)', pass: telemetry.mrr === 0 },
    { label: 'Active paid subscriptions is 0', pass: telemetry.activeSubscriptions === 0 },
    { label: 'Active trials is 0', pass: telemetry.activeTrials === 0 },
    { label: 'Monitored stores is 0', pass: telemetry.totalMonitoredStores === 0 },
    { label: 'Observed SKUs is 0', pass: telemetry.totalSkusTracked === 0 },
    { label: 'Ingestion rate is 0', pass: telemetry.globalIngestionRate === 0 },
    { label: 'Pipeline status is Idle', pass: telemetry.pipelineStatus === 'Idle' },
    { label: 'DLQ count is 0', pass: telemetry.dlqCount === 0 },
    { label: 'Deliverability label is "No Events Yet"', pass: telemetry.deliverabilityLabel === 'No Events Yet' },
  ];

  let allPassed = true;
  for (const a of asserts) {
    console.log(`[${a.pass ? 'PASS' : 'FAIL'}] ${a.label}`);
    if (!a.pass) allPassed = false;
  }

  console.log('\n2. Testing Outbound Dispatch Attribution & Latency Recording:');
  const testDispatchId = `dsp-test-${Date.now()}`;
  await recordDispatchLog({
    dispatch_id: testDispatchId,
    tenant_email: 'yassinesadik0@gmail.com',
    store_url: 'https://testoutfitters.com',
    store_name: 'Test Outfitters Authentic',
    gmc_id: '99887766',
    destination: 'https://hooks.slack.com/services/mock',
    delivery_status: 200,
    status_label: 'Delivered',
    latency_ms: 85,
    payload: { test: true },
  });

  const logs = await getDispatchLogs();
  const testLog = logs.find((l) => l.dispatch_id === testDispatchId);
  console.log('Dispatched log retrieved:', testLog);

  const logAsserts = [
    { label: 'Log has store_name', pass: testLog?.store_name === 'Test Outfitters Authentic' },
    { label: 'Log has gmc_id', pass: testLog?.gmc_id === '99887766' },
    { label: 'Log has latency_ms', pass: Number(testLog?.latency_ms) === 85 },
    { label: 'Log has status_label Delivered', pass: testLog?.status_label === 'Delivered' },
  ];

  for (const a of logAsserts) {
    console.log(`[${a.pass ? 'PASS' : 'FAIL'}] ${a.label}`);
    if (!a.pass) allPassed = false;
  }

  console.log('\n3. Verifying Telemetry with 1 Real Dispatch:');
  const updatedTelemetry = await getSuperTelemetry();
  console.log('Updated Telemetry:', updatedTelemetry);

  const updatedAsserts = [
    { label: 'hasDispatches is true', pass: updatedTelemetry.hasDispatches === true },
    { label: 'deliverabilityLabel is undefined', pass: updatedTelemetry.deliverabilityLabel === undefined },
    { label: 'webhookFailureRate is 0', pass: updatedTelemetry.webhookFailureRate === 0 },
    { label: 'averageLatencyMs > 0', pass: updatedTelemetry.averageLatencyMs > 0 },
  ];

  for (const a of updatedAsserts) {
    console.log(`[${a.pass ? 'PASS' : 'FAIL'}] ${a.label}`);
    if (!a.pass) allPassed = false;
  }

  // Clean up the test dispatch log so DB stays completely clean
  console.log('\n4. Cleaning up test dispatch record...');
  const sql = getDb();
  if (sql) {
    await sql`DELETE FROM dispatch_logs WHERE dispatch_id = ${testDispatchId};`;
  }
  console.log('Test dispatch record cleaned.');

  if (allPassed) {
    console.log('\n>>> ALL TELEMETRY DIRECTIVE TESTS PASSED! <<<');
  } else {
    console.error('\n>>> SOME TESTS FAILED! <<<');
    process.exit(1);
  }
}

verify().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
