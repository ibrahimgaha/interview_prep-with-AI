import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getFeedbackByInterviewId, getInterviewsById } from '@/lib/actions/general.action';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async({params}:RouteParams) => {
  const{ id } = await params; // This is the interview ID
  const user = await getCurrentUser();
  const interview = await getInterviewsById(id);
  if (!interview) redirect('/');

  // Get feedback by interview ID - this should return the feedback, not the interview
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.uid || '',
  });

  // Check if feedback exists
  if (!feedback) {
    return (
      <div className="text-center p-8">
        <h2>No Feedback Available</h2>
        <p>Feedback hasn&apos;t been generated for this interview yet.</p>
        <p>Complete the interview first to generate feedback.</p>
        <a href={`/interview/${id}`} className="text-blue-500 underline">
          Go back to interview
        </a>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">Interview Completed</span>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Interview Feedback
          </h1>

          <p className="text-xl text-gray-600 capitalize font-medium">
            {interview.role} Position Assessment
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Score Display */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">{feedback?.totalScore}</span>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-md">
                  <span className="text-sm font-semibold text-gray-600">/100</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Overall Score</h3>
                <p className="text-gray-600">
                  {feedback?.totalScore >= 80 ? "Excellent Performance" :
                   feedback?.totalScore >= 60 ? "Good Performance" :
                   feedback?.totalScore >= 40 ? "Average Performance" : "Needs Improvement"}
                </p>
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-6 py-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Image src="/calendar.svg" width={20} height={20} alt="calendar" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed on</p>
                <p className="font-semibold text-gray-900">
                  {feedback?.createdAt
                    ? dayjs(feedback.createdAt).format("MMM D, YYYY")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Assessment */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8 animate-fadeIn">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Final Assessment</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">{feedback?.finalAssessment}</p>
        </div>

        {/* Interview Breakdown */}
        <div className="mb-8 animate-fadeIn">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Performance Breakdown</h2>
          <div className="grid gap-6">
            {feedback?.categoryScores?.map((category, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-gray-900">{category.score}</div>
                    <div className="text-gray-500">/100</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${category.score}%` }}
                  ></div>
                </div>

                <p className="text-gray-700 leading-relaxed">{category.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths and Improvements */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8 animate-fadeIn">
          {/* Strengths */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Strengths</h3>
            </div>
            <div className="space-y-4">
              {feedback?.strengths?.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Areas for Improvement</h3>
            </div>
            <div className="space-y-4">
              {feedback?.areasForImprovement?.map((area, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn">
          <Button className="group bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105">
            <Link href="/" className="flex items-center gap-3">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Dashboard
            </Link>
          </Button>

          <Button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105">
            <Link href={`/interview/${id}`} className="flex items-center gap-3">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Interview
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default page;