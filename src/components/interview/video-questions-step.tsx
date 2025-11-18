"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Square, Upload, CheckCircle, Clock, FileVideo, X } from "lucide-react";
import { validateFileSize, validateFileType, formatFileSize } from "@/lib/utils";
import { toast } from "sonner";
import type { Candidate, Question } from "@/types";

interface VideoQuestionsStepProps {
  candidate: Candidate;
  questions: Question[];
  completedQuestions: Set<string>;
  onComplete: () => void;
  onQuestionComplete: (questionId: string) => void;
  onQuestionsLoaded: (questions: Question[]) => void;
}

export function VideoQuestionsStep({
  candidate,
  questions,
  completedQuestions,
  onComplete,
  onQuestionComplete,
  onQuestionsLoaded,
}: VideoQuestionsStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordedBlobs, setRecordedBlobs] = useState<Record<string, Blob>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<string>("");
  const [videoMode, setVideoMode] = useState<'upload' | 'record'>('upload');
  const [cameraPreviewActive, setCameraPreviewActive] = useState(false);
  const [recordedVideoUrls, setRecordedVideoUrls] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [highlightUpload, setHighlightUpload] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Initialize with hardcoded question
    const hardcodedQuestion = {
      id: 'video-question',
      text: 'Please record or upload a video introducing yourself and explaining why you are interested in this position.',
      order: 1,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    onQuestionsLoaded([hardcodedQuestion]);
    setActiveQuestionId(hardcodedQuestion.id);
    setIsLoading(false);
  }, []);

  // Start camera preview when switching to record mode
  useEffect(() => {
    if (videoMode === 'record' && !cameraPreviewActive) {
      startCameraPreview();
    }
    
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoMode]);

  // Update recorded video source when URL changes
  useEffect(() => {
    if (recordedVideoRef.current && recordedVideoUrls[activeQuestionId]) {
      try {
        recordedVideoRef.current.src = recordedVideoUrls[activeQuestionId];
        recordedVideoRef.current.load(); // Force reload the video element
      } catch (error) {
        console.warn('Error setting video source:', error);
        // Clear the problematic URL
        setRecordedVideoUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[activeQuestionId];
          return newUrls;
        });
      }
    } else if (recordedVideoRef.current && !recordedVideoUrls[activeQuestionId]) {
      // Clear video source if no URL for current question
      recordedVideoRef.current.src = '';
    }
  }, [recordedVideoUrls, activeQuestionId]);

  const clearVideoModeData = (questionId: string, keepMode: 'upload' | 'record') => {
    if (keepMode === 'upload') {
      // Clear recorded data
      setRecordedBlobs(prev => {
        const newBlobs = { ...prev };
        delete newBlobs[questionId];
        return newBlobs;
      });
    } else {
      // Clear uploaded data
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[questionId];
        return newFiles;
      });
    }
  };

  const processRecordedVideo = async (webmBlob: Blob, questionId: string): Promise<Blob> => {
    try {
      setIsProcessing(true);
      toast.info('Saving your recording...');
      
      // Send to server for conversion
      const formData = new FormData();
      formData.append('video', webmBlob, 'recording.webm');
      
      const response = await fetch('/api/convert-video', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Server conversion failed');
      }
      
      const convertedBlob = await response.blob();
      console.log('Server conversion completed, output size:', convertedBlob.size);
      
      toast.success('Recording saved as MP4!');
      return convertedBlob;
    } catch (error) {
      console.error('Server conversion failed:', error);
      toast.error('Using original format (WebM)');
      return webmBlob;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearVideoPreview = () => {
    // Stop any active camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear video elements
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
    
    if (recordedVideoRef.current) {
      recordedVideoRef.current.src = '';
    }
    
    // Clean up blob URLs to prevent memory leaks
    Object.values(recordedVideoUrls).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    setRecordedVideoUrls({});
    
    // Stop recording if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    setCameraPreviewActive(false);
  };

  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraPreviewActive(true);
    } catch (error) {
      toast.error('Camera permission denied or not available.');
      console.error('Camera preview error:', error);
    }
  };

  const handleVideoModeChange = (mode: 'upload' | 'record') => {
    setVideoMode(mode);
    clearVideoModeData(activeQuestionId, mode);
    
    if (mode === 'record') {
      startCameraPreview();
    } else {
      // Clear camera preview when switching to upload
      clearVideoPreview();
      setCameraPreviewActive(false);
    }
  };

  const startRecording = async (questionId: string) => {
    try {
      // If there's already a recording for this question, we'll override it
      if (recordedBlobs[questionId]) {
        toast.info('Overriding previous recording...');
      }
      
      // Use existing camera stream if available, otherwise start new one
      let stream = streamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraPreviewActive(true);
      }

      // Try to use the best supported format for browser compatibility
      const options: MediaRecorderOptions = {};
      // Most browsers support WebM but we'll try H.264 compatible codecs first
      if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        options.mimeType = 'video/webm;codecs=h264';
      } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
        options.mimeType = 'video/mp4;codecs=h264';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        options.mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        options.mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];
      
      console.log('Recording with format:', options.mimeType || 'default');

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = options.mimeType || 'video/webm';
        // Create blob with original format for recording
        const originalBlob = new Blob(chunks, { type: mimeType });
        
        console.log('Recording stopped, original blob size:', originalBlob.size);
        
        // Process the recorded video (convert to MP4 on server)
        let finalBlob = originalBlob;
        if (originalBlob.size > 0) {
          try {
            finalBlob = await processRecordedVideo(originalBlob, questionId);
            console.log('Processing completed, final blob type:', finalBlob.type);
          } catch (error) {
            console.error('Processing failed, using original blob:', error);
            toast.info('Recording saved in WebM format');
          }
        }
        
        setRecordedBlobs(prev => ({ ...prev, [questionId]: finalBlob }));
        
        // Clean up previous URL if exists
        if (recordedVideoUrls[questionId]) {
          URL.revokeObjectURL(recordedVideoUrls[questionId]);
        }
        
        // Create new preview URL for the recorded video and force update
        const videoUrl = URL.createObjectURL(finalBlob);
        setRecordedVideoUrls(prev => ({ ...prev, [questionId]: videoUrl }));
        
        // Force video element to reload the new video
        setTimeout(() => {
          if (recordedVideoRef.current && recordedVideoRef.current.src !== videoUrl) {
            recordedVideoRef.current.src = videoUrl;
            recordedVideoRef.current.load();
          }
        }, 100);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      toast.error('Failed to start recording. Please check camera permissions.');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (questionId: string, file: File) => {
    const allowedTypes = ['video/mp4'];
    if (!validateFileType(file, allowedTypes)) {
      toast.error('Please upload an MP4 file only');
      return;
    }

    if (!validateFileSize(file, 5)) {
      toast.error('File size must be less than 5MB');
      return;
    }

  setUploadedFiles(prev => ({ ...prev, [questionId]: file }));
  };

  const getNextUncompletedQuestion = (currentQuestionId: string) => {
    const currentIndex = questions.findIndex(q => q.id === currentQuestionId);
    for (let i = currentIndex + 1; i < questions.length; i++) {
      if (!completedQuestions.has(questions[i].id)) {
        return questions[i].id;
      }
    }
    return null;
  };

  const isLastQuestion = (questionId: string) => {
    const remainingQuestions = questions.filter(q => !completedQuestions.has(q.id));
    return remainingQuestions.length === 1 && remainingQuestions[0].id === questionId;
  };

  const isQuestionAccessible = (questionIndex: number) => {
    // First question is always accessible
    if (questionIndex === 0) return true;
    
    // For subsequent questions, check if all previous questions are completed
    for (let i = 0; i < questionIndex; i++) {
      if (!completedQuestions.has(questions[i].id)) {
        return false;
      }
    }
    return true;
  };

  const getNextAccessibleQuestion = () => {
    for (let i = 0; i < questions.length; i++) {
      if (isQuestionAccessible(i) && !completedQuestions.has(questions[i].id)) {
        return questions[i].id;
      }
    }
    return null;
  };

  const submitVideo = async (questionId: string) => {
    const recordedBlob = recordedBlobs[questionId];
    const uploadedFile = uploadedFiles[questionId];

    if (!recordedBlob && !uploadedFile) {
      toast.error('Please record or upload a video first');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('candidateId', candidate.id);
      
      if (recordedBlob) {
        // Always treat recorded videos as MP4 now (they should be converted by server)
        const videoFile = new File([recordedBlob], `${questionId}.mp4`, {
          type: 'video/mp4'
        });
        formData.append('video', videoFile);
      } else if (uploadedFile) {
        formData.append('video', uploadedFile);
      }

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload video');
      }

      toast.success('Video submitted successfully!');
      
      // Calculate next question before updating completed state
      const currentIndex = questions.findIndex(q => q.id === questionId);
      const nextQuestionIndex = currentIndex + 1;
      
      // Mark question as complete
      onQuestionComplete(questionId);

      // Navigate to next question or complete
      setTimeout(() => {
        if (nextQuestionIndex < questions.length) {
          console.log(`Navigating from question ${currentIndex + 1} to question ${nextQuestionIndex + 1}`);
          const nextQuestionId = questions[nextQuestionIndex].id;
          
          // Clear video preview and stop camera
          clearVideoPreview();
          
          // Switch back to upload tab
          setVideoMode('upload');
          
          // Clear any existing video data for the next question to start fresh
          if (recordedVideoUrls[nextQuestionId]) {
            URL.revokeObjectURL(recordedVideoUrls[nextQuestionId]);
          }
          
          setRecordedBlobs(prev => {
            const newBlobs = { ...prev };
            delete newBlobs[nextQuestionId];
            return newBlobs;
          });
          setRecordedVideoUrls(prev => {
            const newUrls = { ...prev };
            delete newUrls[nextQuestionId];
            return newUrls;
          });
          setUploadedFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[nextQuestionId];
            return newFiles;
          });
          
          // Go to next question
          setActiveQuestionId(nextQuestionId);
        } else {
          console.log('All questions completed, going to final submission');
          // Clear video preview and stop camera
          clearVideoPreview();
          // All questions completed, go to final submission
          onComplete();
        }
      }, 500); // Small delay to show success message

      // Clear the recorded/uploaded video for this question
      setRecordedBlobs(prev => {
        const newBlobs = { ...prev };
        delete newBlobs[questionId];
        return newBlobs;
      });
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[questionId];
        return newFiles;
      });

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit video');
    } finally {
      setIsUploading(false);
    }
  };

  const allQuestionsCompleted = questions.length > 0 && completedQuestions.size === questions.length;
  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  const handleDisabledSubmitClick = () => {
    // Highlight the upload area and switch to upload tab if needed
    setHighlightUpload(true);
    if (videoMode === 'record' && !recordedBlobs[activeQuestionId]) {
      setVideoMode('upload');
    }
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightUpload(false);
    }, 3000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner className="w-8 h-8 mr-2" />
          Loading questions...
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600">No questions available at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-40 sm:pb-32">
      <Card>
        <CardContent className="pt-6">
              {activeQuestion && (
                <>
                  {/* Question Content */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-gray-800 font-bold text-lg mb-2">{activeQuestion.text}</h3>
                    <p className="text-sm text-gray-600">Upload a video file or record a video response</p>
                  </div>

                  {/* Video Mode Tabs */}
                  <Tabs value={videoMode} onValueChange={(value) => handleVideoModeChange(value as 'upload' | 'record')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Video
                      </TabsTrigger>
                      <TabsTrigger value="record" className="flex items-center gap-2">
                        <FileVideo className="w-4 h-4" />
                        Record Video
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-6 pt-4">
                      {!uploadedFiles[activeQuestion.id] ? (
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-500 ${
                            highlightUpload 
                              ? 'border-red-400 bg-red-50 animate-pulse' 
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                          onClick={() => document.getElementById(`video-${activeQuestion.id}`)?.click()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const files = e.dataTransfer.files;
                            if (files.length > 0) {
                              handleFileUpload(activeQuestion.id, files[0]);
                            }
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragLeave={(e) => e.preventDefault()}
                        >
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <FileVideo className={`w-6 h-6 ${highlightUpload ? 'text-red-500' : 'text-gray-400'}`} />
                            <p className={`text-base font-medium ${highlightUpload ? 'text-red-700' : 'text-gray-700'}`}>
                              {highlightUpload ? 'Please upload a video file first!' : 'Drop your video here, or click to browse'}
                            </p>
                          </div>
                          <p className={`text-sm ${highlightUpload ? 'text-red-600' : 'text-gray-500'}`}>
                            MP4 file only (max 5MB)
                          </p>
                          <Input
                            id={`video-${activeQuestion.id}`}
                            type="file"
                            accept="video/mp4"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(activeQuestion.id, file);
                            }}
                            disabled={completedQuestions.has(activeQuestion.id)}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileVideo className="w-8 h-8 text-green-600" />
                              <div>
                                <p className="font-medium text-green-800">{uploadedFiles[activeQuestion.id].name}</p>
                                <p className="text-sm text-green-600">
                                  {formatFileSize(uploadedFiles[activeQuestion.id].size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUploadedFiles(prev => {
                                  const newFiles = { ...prev };
                                  delete newFiles[activeQuestion.id];
                                  return newFiles;
                                });
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="record" className="space-y-6 pt-4">
                      {/* Camera Preview - smaller size */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Camera Preview</h4>
                          <div className="aspect-video bg-black rounded-lg flex items-center justify-center max-w-xs">
                            <video
                              ref={videoRef}
                              autoPlay
                              muted
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Recorded Video Preview */}
                        {recordedBlobs[activeQuestion.id] && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Recorded Video</h4>
                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center max-w-xs">
                              <video
                                ref={recordedVideoRef}
                                controls
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  console.warn('Video playback error (this is normal for blob URLs):', e);
                                  // Don't show error to user for AbortError as it's common with blob URLs
                                }}
                                onLoadStart={() => {
                                  console.log('Video loading started for question:', activeQuestionId);
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => startRecording(activeQuestion.id)}
                          disabled={isRecording || isProcessing || completedQuestions.has(activeQuestion.id)}
                          variant="outline"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {recordedBlobs[activeQuestion.id] ? 'Re-record' : 'Start Recording'}
                        </Button>
                        
                        <Button
                          onClick={stopRecording}
                          disabled={!isRecording || isProcessing}
                          variant="outline"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          {isProcessing ? 'Processing...' : 'Stop Recording'}
                        </Button>
                      </div>

                      {isProcessing && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <LoadingSpinner className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-700 flex-1">
                            Saving your recording...
                          </span>
                        </div>
                      )}

                      {recordedBlobs[activeQuestion.id] && !isProcessing && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700 flex-1">
                            {recordedBlobs[activeQuestion.id].type === 'video/mp4' 
                              ? 'Recording saved successfully' 
                              : 'Video recorded successfully'
                            }
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Clean up blob URL
                              if (recordedVideoUrls[activeQuestion.id]) {
                                URL.revokeObjectURL(recordedVideoUrls[activeQuestion.id]);
                              }
                              
                              setRecordedBlobs(prev => {
                                const newBlobs = { ...prev };
                                delete newBlobs[activeQuestion.id];
                                return newBlobs;
                              });
                              
                              setRecordedVideoUrls(prev => {
                                const newUrls = { ...prev };
                                delete newUrls[activeQuestion.id];
                                return newUrls;
                              });
                              
                              if (recordedVideoRef.current) {
                                recordedVideoRef.current.src = '';
                              }
                            }}
                            className="text-red-500 hover:text-red-700 h-auto p-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  {/* Submit Button */}
                  <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
                    {completedQuestions.has(activeQuestion.id) ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        Question completed
                      </div>
                    ) : (
                      (() => {
                        const isButtonDisabled = isUploading || 
                          (!recordedBlobs[activeQuestion.id] && !uploadedFiles[activeQuestion.id]);
                        
                        const button = (
                          <Button
                            onClick={isButtonDisabled ? handleDisabledSubmitClick : () => submitVideo(activeQuestion.id)}
                            disabled={false}
                            className={isButtonDisabled ? "cursor-pointer opacity-50" : "cursor-pointer"}
                            style={{
                              backgroundColor: '#327eb4',
                              borderColor: '#327eb4',
                            }}
                          >
                            {isUploading ? (
                              <div className="flex items-center gap-2">
                                <LoadingSpinner className="w-4 h-4" />
                                Uploading...
                              </div>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                {isLastQuestion(activeQuestion.id) 
                                  ? "Submit Video & Go To Review" 
                                  : "Submit Video & Next"
                                }
                              </>
                            )}
                          </Button>
                        );

                        // Only show tooltip when button is disabled
                        if (isButtonDisabled) {
                          return (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {button}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Please upload or record a video to submit your answer</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        }

                        // Return button without tooltip when enabled
                        return button;
                      })()
                    )}
                  </div>
                </>
              )}
        </CardContent>
      </Card>


    </div>
  );
}
