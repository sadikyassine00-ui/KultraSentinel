import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import {
  getStoreByIdAndTenant,
  updateStoreForTenant,
  deleteStoreForTenant,
} from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getAnySession(request);
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required to access store details.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid store identifier.' }, { status: 400 });
  }
  const storeId = isNaN(Number(id)) ? id : Number(id);

  // Anti-IDOR: Must match item ID AND authenticated user tenant simultaneously
  const store = await getStoreByIdAndTenant(storeId, session.email);
  if (!store) {
    return NextResponse.json(
      { error: 'Store record not found or access denied for authenticated tenant.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, store });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAnySession(request);
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required to modify store.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid store identifier.' }, { status: 400 });
  }
  const storeId = isNaN(Number(id)) ? id : Number(id);

  try {
    const body = await request.json();
    // Anti-IDOR: Compound update strictly scoped to authenticated user tenant
    const updatedStore = await updateStoreForTenant(storeId, session.email, {
      store_url: body.store_url,
      pubsub_topic: body.pubsub_topic,
      status: body.status,
    });

    if (!updatedStore) {
      return NextResponse.json(
        { error: 'Store record not found or access denied for authenticated tenant.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, store: updatedStore });
  } catch (error) {
    console.error('[Store Patch Error]', error);
    return NextResponse.json({ error: 'Failed to update store record.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getAnySession(request);
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required to delete store.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const storeId = parseInt(id, 10);
  if (isNaN(storeId)) {
    return NextResponse.json({ error: 'Invalid store identifier.' }, { status: 400 });
  }

  // Anti-IDOR: Compound deletion strictly scoped to authenticated user tenant
  const deleted = await deleteStoreForTenant(storeId, session.email);
  if (!deleted) {
    return NextResponse.json(
      { error: 'Store record not found or access denied for authenticated tenant.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: 'Store removed successfully from tenant registry.' });
}
