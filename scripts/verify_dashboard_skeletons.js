const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'yassinesadik0@gmail.com';
const ADMIN_PASS = 'KultraSentinel2026!';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path || '/', BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      if (typeof postData === 'string') {
        req.write(postData);
      } else {
        req.write(JSON.stringify(postData));
      }
    }
    req.end();
  });
}

async function verifySkeletons() {
  console.log('====================================================');
  console.log('VERIFYING SKELETON LOADING & DESIGN FIDELITY');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Verify globals.css skeleton-shimmer definitions
  const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'globals.css'), 'utf8');
  assert(css.includes('@keyframes skeleton-shimmer'), 'globals.css defines @keyframes skeleton-shimmer');
  assert(css.includes('.skeleton-shimmer'), 'globals.css defines .skeleton-shimmer class');
  assert(css.includes('prefers-reduced-motion: reduce'), 'globals.css handles prefers-reduced-motion for skeletons');

  // 2. Verify Skeleton.tsx library
  const skeletonSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'Skeleton.tsx'), 'utf8');
  assert(skeletonSource.includes('export function Skeleton'), 'Skeleton base atom is exported');
  assert(skeletonSource.includes('export function KpiCardSkeleton'), 'KpiCardSkeleton is exported');
  assert(skeletonSource.includes('export function TelemetryKpiGridSkeleton'), 'TelemetryKpiGridSkeleton is exported');
  assert(skeletonSource.includes('export function HealthConsoleSkeleton'), 'HealthConsoleSkeleton is exported');
  assert(skeletonSource.includes('export function TenantsTabSkeleton'), 'TenantsTabSkeleton is exported');
  assert(skeletonSource.includes('export function StoresTabSkeleton'), 'StoresTabSkeleton is exported');
  assert(skeletonSource.includes('export function PipelineDlqTabSkeleton'), 'PipelineDlqTabSkeleton is exported');
  assert(skeletonSource.includes('export function DispatchesTabSkeleton'), 'DispatchesTabSkeleton is exported');
  assert(skeletonSource.includes('export function ConfigTabSkeleton'), 'ConfigTabSkeleton is exported');
  assert(skeletonSource.includes('export function DashboardPageSkeleton'), 'DashboardPageSkeleton is exported');

  // 3. Verify Next.js 15 loading.tsx
  const loadingSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', 'dashboard', 'loading.tsx'), 'utf8');
  assert(loadingSource.includes('DashboardPageSkeleton'), 'admin/dashboard/loading.tsx renders DashboardPageSkeleton');

  // 4. Verify page.tsx integration
  const pageSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', 'dashboard', 'page.tsx'), 'utf8');
  assert(pageSource.includes('tabLoading'), 'tabLoading state variable configured');
  assert(pageSource.includes('isRefreshing'), 'isRefreshing state variable configured');
  assert(pageSource.includes('<DashboardPageSkeleton />'), 'page.tsx returns DashboardPageSkeleton while loading');
  assert(pageSource.includes('<TenantsTabSkeleton />'), 'page.tsx renders TenantsTabSkeleton');
  assert(pageSource.includes('<StoresTabSkeleton />'), 'page.tsx renders StoresTabSkeleton');
  assert(pageSource.includes('<PipelineDlqTabSkeleton />'), 'page.tsx renders PipelineDlqTabSkeleton');
  assert(pageSource.includes('<DispatchesTabSkeleton />'), 'page.tsx renders DispatchesTabSkeleton');
  assert(pageSource.includes('<ConfigTabSkeleton />'), 'page.tsx renders ConfigTabSkeleton');

  // 5. Test Live HTTP endpoint
  const loginRes = await request(
    {
      method: 'POST',
      path: '/api/auth/login',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: ADMIN_EMAIL, password: ADMIN_PASS }
  );
  assert(loginRes.statusCode === 200, 'Admin login succeeded');
  const setCookie = loginRes.headers['set-cookie'];
  const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie || '';
  const tokenMatch = cookieStr.match(/kultra_admin_session=([^;]+)/);
  const sessionToken = tokenMatch ? tokenMatch[1] : '';

  const dashboardRes = await request({
    method: 'GET',
    path: '/admin/dashboard',
    headers: {
      Cookie: `kultra_admin_session=${sessionToken}`,
    },
  });
  assert(dashboardRes.statusCode === 200, 'Dashboard responds 200 OK with skeleton markup');
  assert(dashboardRes.body.includes('skeleton-shimmer'), 'Live SSR HTML contains skeleton-shimmer markup');

  console.log('\n====================================================');
  console.log(`SKELETON VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

verifySkeletons();
