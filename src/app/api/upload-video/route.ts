import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/pocketbase';

// Configure body size limit for video uploads (5MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const pb = await authenticateAdmin();
    
    const formData = await request.formData();
    
    const candidateId = formData.get('candidateId') as string;
    const videoFile = formData.get('video') as File;

    if (!candidateId || !videoFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current candidate
    const candidate = await pb.collection('candidates').getOne(candidateId);
    
    // Upload video to the video field (simplified - no more multiple questions)
    const videoFieldName = 'video';
    const uploadFormData = new FormData();
    uploadFormData.append(videoFieldName, videoFile);

    console.log('Attempting to upload to field:', videoFieldName, 'File:', videoFile.name, 'Size:', videoFile.size);

    // Update the candidate record with the video file
    const updatedCandidate = await pb.collection('candidates').update(candidateId, uploadFormData);
    
    console.log('Updated candidate fields:', Object.keys(updatedCandidate));
    console.log('Video field value:', updatedCandidate[videoFieldName]);
    
    // Get the video URL from the uploaded file
    const videoFileName = updatedCandidate[videoFieldName];
    
    // Check if video file was actually uploaded
    if (!videoFileName) {
      console.error('Video file was not uploaded properly. Field name:', videoFieldName);
      return NextResponse.json(
        { error: 'Video file upload failed - no filename returned' },
        { status: 500 }
      );
    }
    
    const videoUrl = pb.files.getURL(updatedCandidate, videoFileName);
    
    console.log('Debug info:', {
      videoFieldName,
      videoFileName,
      videoUrl,
      hasVideoFile: !!videoFileName
    });
    
    // Validate video URL
    if (!videoUrl || videoUrl.length === 0) {
      console.error('Video URL is empty or invalid:', videoUrl);
      return NextResponse.json(
        { error: 'Failed to generate video URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      videoUrl
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}