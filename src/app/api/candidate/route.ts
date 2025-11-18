import { NextRequest, NextResponse } from 'next/server';
import pb from '@/lib/pocketbase';
import type { Candidate } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');
  if (!id && !email) {
    return NextResponse.json({ error: 'Missing candidate id or email' }, { status: 400 });
  }
  try {
    let candidate;
    if (id) {
      candidate = await pb.collection('candidates').getOne<Candidate>(id);
    } else if (email) {
      candidate = await pb.collection('candidates').getFirstListItem<Candidate>(`email="${email}"`);
    }
    return NextResponse.json({ candidate });
  } catch (error) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }
}
