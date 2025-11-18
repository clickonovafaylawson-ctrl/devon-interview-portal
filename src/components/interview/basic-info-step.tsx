"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { candidateFormSchema, type CandidateFormData } from "@/lib/validations";
import { validateFileSize, validateFileType, formatFileSize } from "@/lib/utils";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";
import type { Candidate } from "@/types";

interface BasicInfoStepProps {
  onComplete: (candidate: Candidate) => void;
}

export function BasicInfoStep({ onComplete }: BasicInfoStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [resumeError, setResumeError] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [highlightErrors, setHighlightErrors] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
  });

  // Watch form values to check for empty required fields
  const formValues = watch();

  // Helper function to check if a field should be highlighted
  const shouldHighlightField = (fieldName: keyof CandidateFormData) => {
    const hasError = !!errors[fieldName];
    const isEmpty = !formValues?.[fieldName] || formValues[fieldName].toString().trim() === '';
    return highlightErrors && (hasError || isEmpty);
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!validateFileType(file, allowedTypes)) {
      setResumeError("Please upload a PDF or DOCX file");
      toast.error("Please upload a PDF or DOCX file");
      return false;
    }

    // Validate file size (5MB)
    if (!validateFileSize(file, 5)) {
      setResumeError("File size must be less than 5MB");
      toast.error("File size must be less than 5MB");
      return false;
    }

    setSelectedFile(file);
    setResumeError("");
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!validateAndSetFile(file)) {
      event.target.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setResumeError("");
  };

  const onSubmit = async (data: CandidateFormData) => {
    if (!selectedFile) {
      setResumeError("Resume is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('mobile', data.mobile);
      formData.append('resume', selectedFile);

      const response = await fetch('/api/submit-info', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.existingCandidate) {
          setShowOverrideModal(true);
          return;
        }
        throw new Error(result.error || 'Failed to submit information');
      }

      toast.success("Information submitted successfully!");
      onComplete(result.candidate);

    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverride = async () => {
    if (!selectedFile) {
      setResumeError("Resume is required");
      return;
    }

    setShowOverrideModal(false);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const currentFormData = new FormData(document.querySelector('form') as HTMLFormElement);
      
      formData.append('name', currentFormData.get('name') as string);
      formData.append('email', currentFormData.get('email') as string);
      formData.append('mobile', currentFormData.get('mobile') as string);
      formData.append('resume', selectedFile);
      formData.append('override', 'true'); // Flag to indicate override

      const response = await fetch('/api/submit-info', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit information');
      }

      toast.success("Information updated successfully!");
      onComplete(result.candidate);

    } catch (error) {
      console.error('Override error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisabledContinueClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Set custom error for resume if not selected
    if (!selectedFile) {
      setResumeError("Please upload your resume");
    }
    
    // Highlight error fields and empty required fields
    setHighlightErrors(true);
    
    // Scroll to first error field after a brief delay to ensure DOM is updated
    setTimeout(() => {
      const firstErrorField = document.querySelector('.border-red-500, [data-error="true"]') as HTMLElement;
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightErrors(false);
      setResumeError(""); // Clear resume error when highlight fades
    }, 3000);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter your full name"
                className={`${errors.name ? "border-red-500" : ""} ${
                  shouldHighlightField("name") ? "animate-pulse border-red-400 bg-red-50" : ""
                }`}
                data-error={shouldHighlightField("name") ? "true" : "false"}
              />
              {errors.name && (
                <p className={`text-sm text-red-500 ${highlightErrors ? "font-semibold" : ""}`}>
                  {errors.name.message}
                </p>
              )}
              {highlightErrors && !formValues?.name && !errors.name && (
                <p className="text-sm text-red-500 font-semibold">Please enter your full name</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter your email address"
                className={`${errors.email ? "border-red-500" : ""} ${
                  shouldHighlightField("email") ? "animate-pulse border-red-400 bg-red-50" : ""
                }`}
                data-error={shouldHighlightField("email") ? "true" : "false"}
              />
              {errors.email && (
                <p className={`text-sm text-red-500 ${highlightErrors ? "font-semibold" : ""}`}>
                  {errors.email.message}
                </p>
              )}
              {highlightErrors && !formValues?.email && !errors.email && (
                <p className="text-sm text-red-500 font-semibold">Please enter your email address</p>
              )}
            </div>

            {/* Mobile Field */}
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                {...register("mobile")}
                placeholder="Enter 10-digit mobile number"
                className={`${errors.mobile ? "border-red-500" : ""} ${
                  shouldHighlightField("mobile") ? "animate-pulse border-red-400 bg-red-50" : ""
                }`}
                data-error={shouldHighlightField("mobile") ? "true" : "false"}
              />
              {errors.mobile && (
                <p className={`text-sm text-red-500 ${highlightErrors ? "font-semibold" : ""}`}>
                  {errors.mobile.message}
                </p>
              )}
              {highlightErrors && !formValues?.mobile && !errors.mobile && (
                <p className="text-sm text-red-500 font-semibold">Please enter your mobile number</p>
              )}
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume">Resume *</Label>
              
              {!selectedFile ? (
                <div
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-500
                    ${isDragOver 
                      ? 'bg-blue-50' 
                      : resumeError 
                        ? 'border-red-300 bg-red-50' 
                        : highlightErrors && !selectedFile
                          ? 'border-red-400 bg-red-50 animate-pulse'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                  data-error={!selectedFile ? "true" : "false"}
                  style={{
                    borderColor: isDragOver ? '#327eb4' : undefined
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('resume')?.click()}
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Upload className={`w-6 h-6 ${highlightErrors && !selectedFile ? 'text-red-500' : 'text-gray-400'}`} />
                    <p className={`text-base font-medium ${highlightErrors && !selectedFile ? 'text-red-700' : 'text-gray-700'}`}>
                      {highlightErrors && !selectedFile ? 'Please upload your resume first!' : 'Drop your resume here, or click to browse'}
                    </p>
                  </div>
                  <p className={`text-sm ${highlightErrors && !selectedFile ? 'text-red-600' : 'text-gray-500'}`}>
                    PDF or DOCX file (max 5MB)
                  </p>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{selectedFile.name}</p>
                        <p className="text-sm text-green-600">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {resumeError && (
                <p className="text-sm text-red-500">{resumeError}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type={Object.keys(errors).length > 0 || !selectedFile ? "button" : "submit"}
              className={`w-60 mx-auto block cursor-pointer ${
                Object.keys(errors).length > 0 || !selectedFile ? "opacity-50" : ""
              }`}
              disabled={isSubmitting}
              onClick={(e) => {
                // Check if form is invalid
                const hasErrors = Object.keys(errors).length > 0 || !selectedFile;
                if (hasErrors && !isSubmitting) {
                  handleDisabledContinueClick(e);
                }
              }}
              style={{
                backgroundColor: 'var(--devon-orange)',
                borderColor: 'var(--devon-orange)',
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner className="w-4 h-4" />
                  Submitting...
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-2xl border-2">
            <CardHeader>
              <CardTitle>Email Already Exists</CardTitle>
              <CardDescription>
                You have previously filled this form. Submitting again will override your previous application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowOverrideModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOverride}
                  className="flex-1"
                  style={{
                    backgroundColor: 'var(--devon-orange)',
                    borderColor: 'var(--devon-orange)',
                  }}
                >
                  Override
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}