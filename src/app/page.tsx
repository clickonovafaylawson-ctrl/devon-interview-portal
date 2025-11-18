"use client";

import { Header } from "@/components/interview/header";
import { InterviewPortal } from "@/components/interview/interview-portal";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="container mx-auto px-4 py-8 pb-24 h-full">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex-1">
              <InterviewPortal />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="text-center">
            <p className="text-xs text-gray-600">
              In case of any problem, simply refresh the page & start over | Help - 
              <a href="mailto:RecruitmentTechpirates@devon.nl" className="text-blue-600 hover:text-blue-800 underline ml-1">
                RecruitmentTechpirates@devon.nl
              </a>
            </p>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}