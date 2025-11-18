import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/pocketbase';
import { candidateFormSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // Authenticate as admin
    const pb = await authenticateAdmin();
    
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const mobile = formData.get('mobile') as string;
    const resumeFile = formData.get('resume') as File;
    const override = formData.get('override') === 'true';

    // Validate form data
    const validationResult = candidateFormSchema.safeParse({
      name,
      email,
      mobile,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    if (!resumeFile) {
      return NextResponse.json(
        { error: 'Resume file is required' },
        { status: 400 }
      );
    }

    // Check if candidate already exists
    let existingCandidate = null;
    try {
      existingCandidate = await pb.collection('candidates').getFirstListItem(`email="${email}"`);
      
      // If not overriding, return conflict error
      if (!override) {
        return NextResponse.json(
          { 
            error: 'Email already exists',
            message: 'You have previously filled this form. Submitting again will override your previous application.',
            existingCandidate: true
          },
          { status: 409 }
        );
      }
    } catch (error) {
      // Candidate doesn't exist, continue with creation
    }

    // Create or update candidate with resume
    const candidateData = new FormData();
    candidateData.append('name', name);
    candidateData.append('email', email);
    candidateData.append('mobile', mobile);
    candidateData.append('resume', resumeFile);

    let candidate;
    if (existingCandidate && override) {
      // Update existing candidate
      candidate = await pb.collection('candidates').update(existingCandidate.id, candidateData);
    } else {
      // Create new candidate
      candidate = await pb.collection('candidates').create(candidateData);
    }

    return NextResponse.json({ candidate });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { error: 'Failed to submit information' },
      { status: 500 }
    );
  }
}