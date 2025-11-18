import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/pocketbase';

export async function POST(request: NextRequest) {
  try {
    const pb = await authenticateAdmin();
    
    const { candidateId } = await request.json();

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Update candidate with submission timestamp
    await pb.collection('candidates').update(candidateId, {
      submittedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error finalizing submission:', error);
    return NextResponse.json(
      { error: 'Failed to finalize submission' },
      { status: 500 }
    );
  }
}