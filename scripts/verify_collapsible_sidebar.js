const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env.local if present
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  // Ignore
}

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'yassinesadik0@gmail.com';
const ADMIN_PASS = 'KultraSentinel2026!';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path || '/', options.baseUrl || BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: url.hostname,
      port: url.port || 80,
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

async function verifyCollapsibleSidebar() {
  console.log('====================================================');
  console.log('VERIFYING COLLAPSIBLE & UNBLOATED SIDEBAR');
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

  // 1. Log in as Sole Admin
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
  assert(!!sessionToken, 'Extracted valid session token');

  // 2. Fetch /admin/dashboard HTML
  const dashboardRes = await request({
    method: 'GET',
    path: '/admin/dashboard',
    headers: {
      Cookie: `kultra_admin_session=${sessionToken}`,
    },
  });

  assert(dashboardRes.statusCode === 200, 'Dashboard loaded with 200 OK');
  const html = dashboardRes.body;

  // 3. Verify that the bloated widgets are NOT in the sidebar
  assert(!html.includes('Sentinel Engine Status Card'), 'Bloated "Sentinel Engine Status Card" removed');
  assert(!html.includes('Platform Quick Pulse Mini-Widget'), 'Bloated "Platform Pulse Mini-Widget" removed');

  // 4. Verify source code of page.tsx has the collapsible structure
  const pageSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', 'dashboard', 'page.tsx'), 'utf8');

  assert(pageSource.includes('sidebarCollapsed'), 'sidebarCollapsed state variable is defined');
  assert(pageSource.includes('localStorage.getItem(\'kultra_sidebar_collapsed\')'), 'Persists collapse state to localStorage');
  assert(pageSource.includes('toggleSidebar'), 'toggleSidebar handler function is defined');
  assert(pageSource.includes('PanelLeftClose'), 'PanelLeftClose collapse button icon is present');
  assert(pageSource.includes('PanelLeftOpen'), 'PanelLeftOpen expand button icon is present');
  assert(pageSource.includes('lg:w-[68px]'), 'Collapsed slim rail width class lg:w-[68px] is defined');
  assert(pageSource.includes('lg:w-64'), 'Expanded sidebar width class lg:w-64 is defined');
  assert(pageSource.includes('transition-all duration-300 ease-in-out'), 'Smooth width transition duration-300 is configured');
  assert(pageSource.includes('lg:group-hover:flex'), 'Hover tooltips for collapsed icons are configured');

  console.log('\n====================================================');
  console.log(`COLLAPSIBLE SIDEBAR VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

verifyCollapsibleSidebar();
