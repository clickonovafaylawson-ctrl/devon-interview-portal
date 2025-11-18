import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let inputPath = '';
  let outputPath = '';

  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'Missing video file' },
        { status: 400 }
      );
    }

    // Create temporary file paths
    const tempDir = tmpdir();
    const timestamp = Date.now();
    inputPath = join(tempDir, `input_${timestamp}.webm`);
    outputPath = join(tempDir, `output_${timestamp}.mp4`);

    // Write input file
    const buffer = await videoFile.arrayBuffer();
    await writeFile(inputPath, new Uint8Array(buffer));

    console.log('Converting video:', inputPath, '->', outputPath);

    // Convert using FFmpeg with optimized settings for web
    const command = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', 'faststart',
      '-f', 'mp4',
      `"${outputPath}"`
    ].join(' ');

    await execAsync(command);

    // Read converted file
    const convertedBuffer = await readFile(outputPath);
    
    console.log('Conversion completed successfully');

    // Clean up temporary files
    try {
      await unlink(inputPath);
      await unlink(outputPath);
    } catch (cleanupError) {
      console.warn('Cleanup failed:', cleanupError);
    }

    // Return the converted video
    return new NextResponse(convertedBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': convertedBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Video conversion failed:', error);
    
    // Clean up on error
    try {
      if (inputPath) await unlink(inputPath);
      if (outputPath) await unlink(outputPath);
    } catch (cleanupError) {
      console.warn('Error cleanup failed:', cleanupError);
    }

    return NextResponse.json(
      { error: 'Video conversion failed' },
      { status: 500 }
    );
  }
}