"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle, User, Mail, Phone, FileText, Video } from "lucide-react";
import { toast } from "sonner";
import type { Candidate } from "@/types";
import { useRouter } from "next/navigation";

interface FinalSubmissionStepProps {
  candidate: Candidate;
}

export function FinalSubmissionStep({ candidate }: FinalSubmissionStepProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [latestCandidate, setLatestCandidate] = useState<Candidate>(candidate);

  // Scroll to top and fetch latest candidate record on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    async function fetchLatestCandidate() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/candidate?email=${encodeURIComponent(candidate.email)}`);
        if (res.ok) {
          const data = await res.json();
          setLatestCandidate(data.candidate || candidate);
        } else {
          setLatestCandidate(candidate);
        }
      } catch {
        setLatestCandidate(candidate);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLatestCandidate();
  }, [candidate.email]);

  const handleFinalSubmit = async () => {
    if (!isAuthorized) {
      toast.error("Please authorize DevOn to proceed with your application");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/final-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidate.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to finalize submission');
      }

      toast.success("Application submitted successfully!");
      setIsCompleted(true);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOver = () => {
    // Refresh the page to start over
    window.location.reload();
  };

  if (isCompleted) {
    return (
      <div className="pb-32">
        <Card>
          <CardContent className="text-center py-12">
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-green-600">
              Thank You!
            </h2>
            <p className="text-lg text-gray-700 max-w-md mx-auto">
              We have received your information. Keep an eye out for an email from us for further process in near future.
            </p>
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                Application submitted on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pb-32">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <LoadingSpinner className="w-8 h-8 mr-2" />
            Loading your submission...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
          <CardDescription>
            Please review your information before final submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Name</p>
                <p className="text-gray-600">{latestCandidate.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-gray-600">{latestCandidate.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Mobile</p>
                <p className="text-gray-600">{latestCandidate.mobile}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Resume</p>
                <p className="text-gray-600">
                  {latestCandidate.resume ? "✓ Uploaded" : "✗ Not uploaded"}
                </p>
              </div>
            </div>
          </div>

          {/* Video Status */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <Video className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Video Response</p>
                <p className="text-gray-600">
                  {latestCandidate.video ? "✓ Uploaded" : "✗ Not uploaded"}
                </p>
              </div>
            </div>
            
            {latestCandidate.video ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Video response completed</span>
              </div>
            ) : (
              <div className="text-orange-600 text-sm">
                ⚠ Please record your video response before final submission
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Authorization and Final Submit */}
      <Card>
        <CardHeader>
          <CardTitle>Final Authorization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="authorization"
              checked={isAuthorized}
              onCheckedChange={(checked) => setIsAuthorized(checked as boolean)}
              autoFocus={false}
              className={`mt-1 transition-all duration-200 ${
                !isAuthorized 
                  ? 'border-red-300 shadow-sm shadow-red-200 border-2' 
                  : 'border-green-500 shadow-sm shadow-green-200 border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500'
              }`}
            />
            <label
              htmlFor="authorization"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I authorize DevOn to store my information and contact me for recruitment purposes.
            </label>
          </div>

          <div className="flex flex-col items-center pt-4 pb-6 space-y-4">
            <Button
              onClick={handleFinalSubmit}
              disabled={
                !isAuthorized || 
                !latestCandidate.video || 
                isSubmitting
              }
              size="lg"
              style={{
                backgroundColor: 'var(--devon-orange)',
                borderColor: 'var(--devon-orange)',
              }}
              className="min-w-48"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner className="w-4 h-4" />
                  Submitting Application...
                </div>
              ) : (
                "Submit Application"
              )}
            </Button>

            {/* Cancel & Start Again Button */}
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              className="bg-white text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700"
              size="lg"
            >
              Cancel & Start Again
            </Button>
          </div>


        </CardContent>
      </Card>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-2xl border-2">
            <CardHeader>
              <CardTitle>Start Over?</CardTitle>
              <CardDescription>
                Are you sure you want to start over? Your progress will be lost.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1"
                >
                  No
                </Button>
                <Button
                  onClick={handleStartOver}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  Yes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}