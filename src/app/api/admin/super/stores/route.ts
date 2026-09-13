import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getStores, triggerStoreSync, cleanupOrphanStores } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const accountType = searchParams.get('accountType') || undefined;

  try {
    const stores = await getStores({ search, accountType });
    return NextResponse.json({ success: true, stores });
  } catch (error) {
    console.error('Super Stores Query Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve store registry' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, storeId } = body;

    if (action === 'sync') {
      if (!storeId) {
        return NextResponse.json({ error: 'Missing storeId for sync' }, { status: 400 });
      }
      const result = await triggerStoreSync(Number(storeId));
      return NextResponse.json({ success: true, message: result.message });
    }

    if (action === 'cleanupOrphans') {
      const result = await cleanupOrphanStores();
      return NextResponse.json({
        success: true,
        purgedCount: result.purgedCount,
        message: `Orphan cleanup complete. Purged ${result.purgedCount} disconnected merchant store entries.`,
      });
    }

    return NextResponse.json({ error: `Unsupported store action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('Store Action Error:', error);
    return NextResponse.json({ error: 'Failed to execute store action' }, { status: 500 });
  }
}
