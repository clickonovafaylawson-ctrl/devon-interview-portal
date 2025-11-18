"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BasicInfoStep } from "./basic-info-step";
import { VideoQuestionsStep } from "./video-questions-step";
import { FinalSubmissionStep } from "./final-submission-step";
import type { Candidate, Question } from "@/types";

type Step = 1 | 2 | 3;

interface InterviewState {
  currentStep: Step;
  candidate: Candidate | null;
  questions: Question[];
  completedQuestions: Set<string>;
}

export function InterviewPortal() {
  const [state, setState] = useState<InterviewState>({
    currentStep: 1,
    candidate: null,
    questions: [],
    completedQuestions: new Set(),
  });

  const [showVideoModal, setShowVideoModal] = useState(false);

  const progress = ((state.currentStep - 1) / 2) * 100;

  const handleBasicInfoComplete = (candidate: Candidate) => {
    setState(prev => ({
      ...prev,
      currentStep: 2,
      candidate,
    }));
    setShowVideoModal(true);
  };

  const handleModalConfirm = () => {
    setShowVideoModal(false);
  };

  const handleVideoQuestionsComplete = () => {
    setState(prev => ({
      ...prev,
      currentStep: 3,
    }));
  };

  const handleQuestionComplete = (questionId: string) => {
    setState(prev => ({
      ...prev,
      completedQuestions: new Set([...prev.completedQuestions, questionId]),
    }));
  };

  const handleQuestionsLoaded = (questions: Question[]) => {
    setState(prev => ({
      ...prev,
      questions,
    }));
  };

  return (
    <>
      {/* Video Instructions Modal */}
      <Dialog open={showVideoModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Video Upload Instructions</DialogTitle>
            <DialogDescription>
              You can either upload a video in Upload Video tab or record a video in the Record Video tab.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={handleModalConfirm} 
              className="w-full"
              style={{
                backgroundColor: '#327eb4',
                borderColor: '#327eb4',
              }}
            >
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  <div className="space-y-4 pb-18">
        {/* Progress Bar */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <span className={`text-sm font-medium ${state.currentStep >= 1 ? "" : "text-gray-500"}`} style={{color: state.currentStep >= 1 ? "#327eb4" : undefined}}>
                Basic Info
              </span>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-2
                ${state.currentStep >= 1 
                  ? "text-white" 
                  : "bg-gray-200 text-gray-500"
                }
              `} style={{backgroundColor: state.currentStep >= 1 ? "#327eb4" : undefined}}>
                1
              </div>
            </div>
            
            {/* Connection Line 1 */}
            <div className="flex-1 flex items-center justify-center">
              <div className={`h-0.5 w-full ${state.currentStep >= 2 ? "" : "bg-gray-300"}`} style={{backgroundColor: state.currentStep >= 2 ? "#327eb4" : undefined}} />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <span className={`text-sm font-medium ${state.currentStep >= 2 ? "" : "text-gray-500"}`} style={{color: state.currentStep >= 2 ? "#327eb4" : undefined}}>
                Upload Video
              </span>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-2
                ${state.currentStep >= 2 
                  ? "text-white" 
                  : "bg-gray-200 text-gray-500"
                }
              `} style={{backgroundColor: state.currentStep >= 2 ? "#327eb4" : undefined}}>
                2
              </div>
            </div>

            {/* Connection Line 2 */}
            <div className="flex-1 flex items-center justify-center">
              <div className={`h-0.5 w-full ${state.currentStep >= 3 ? "" : "bg-gray-300"}`} style={{backgroundColor: state.currentStep >= 3 ? "#327eb4" : undefined}} />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <span className={`text-sm font-medium ${state.currentStep >= 3 ? "" : "text-gray-500"}`} style={{color: state.currentStep >= 3 ? "#327eb4" : undefined}}>
                Review & Submit
              </span>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-2
                ${state.currentStep >= 3 
                  ? "text-white" 
                  : "bg-gray-200 text-gray-500"
                }
              `} style={{backgroundColor: state.currentStep >= 3 ? "#327eb4" : undefined}}>
                3
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Step Content */}
      {state.currentStep === 1 && (
        <BasicInfoStep onComplete={handleBasicInfoComplete} />
      )}

      {state.currentStep === 2 && state.candidate && (
        <VideoQuestionsStep
          candidate={state.candidate}
          questions={state.questions}
          completedQuestions={state.completedQuestions}
          onComplete={handleVideoQuestionsComplete}
          onQuestionComplete={handleQuestionComplete}
          onQuestionsLoaded={handleQuestionsLoaded}
        />
      )}

      {state.currentStep === 3 && state.candidate && (
        <FinalSubmissionStep
          candidate={state.candidate}
        />
      )}
      </div>
    </>
  );
}