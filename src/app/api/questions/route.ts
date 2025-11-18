import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/pocketbase';
import type { Question } from '@/types';

export async function GET() {
  try {
    const pb = await authenticateAdmin();
    
    const questions = await pb.collection('questions').getFullList<Question>({
      sort: 'order'
    });

    return NextResponse.json(questions);
  } catch (error: any) {
    // Handle abort errors more gracefully
    if (error?.isAbort) {
      console.log('Questions request was aborted, but this is normal during development');
      return NextResponse.json(
        { error: 'Request was aborted' },
        { status: 408 } // Request Timeout
      );
    }
    
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}