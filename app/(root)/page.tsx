import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import { getCurrentUser, getInterviewsByUserId, getLatestInterviews } from '@/lib/actions/auth.action'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Home = async () => {
  const user = await getCurrentUser();

  // Use Promise.all to fetch data concurrently (removed duplicate calls)
  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user?.uid || ''),
    getLatestInterviews({ userId: user?.uid || '' })
  ]);

  // Debug logging
  console.log('User:', user?.uid);
  console.log('User interviews:', userInterviews);
  console.log('Latest interviews:', latestInterviews);

  const hasPastInterviews = userInterviews && userInterviews.length > 0;
  const hasUpcomingInterviews = latestInterviews && latestInterviews.length > 0;
  return (
    <>
      <section className='card-cta'>
        <div className='flex flex-col max-w-lg gap-6'>
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className='text-lg'>Practice on real interview questions & get instant feedback</p>
          <Button asChild className='btn-primary max-sm:w-full'>
            <Link className='flex items-center gap-2' href='/interview'>
              Start an interview
            </Link>
          </Button>
        </div>
        <Image src="/robot.png" alt="robot" width={400} height={400} className='max-sm:hidden' />
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Interviews</h2>

        <div className='interviews-section'>
          {hasPastInterviews ? (
            userInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>You haven&apos;t created any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Latest Interviews</h2>
        <div className='interviews-section'>
          {hasUpcomingInterviews ? (
            latestInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>No recent interviews available</p>
          )}
        </div>
      </section>
    </>
  )
}

export default Home
