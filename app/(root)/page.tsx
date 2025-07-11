import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import { dummyInterviews } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Home = () => {
  return (
    <>
      <section className='card-cta'>
        <div className='flex flex-col max-w-lg gap-6'>
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className='text-lg'>Practice on real interview questions & get instance feedback</p>
          <Button asChild className='btn-primary max-sm:w-full'>
            <Link className='flex items-center gap-2' href='/interview'>
              Start an interview
            </Link>
          </Button>
        </div>
        <Image src ="/robot.png" alt="robot" width={400} height={400} className='max-sm:hidden'/>
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Interviews</h2>

        <div className='interviews-section'>
          {dummyInterviews.map((interview) => (
           <InterviewCard {...interview} key={interview.id}/>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an interview</h2>
        <div className='interviews-section'>
          {dummyInterviews.map((interview) => (
           <InterviewCard {...interview} key={interview.id}/>
          ))}
          {/* <p>You haven&apos;t taken any interviews yet</p> */}
        </div>
      </section>
    </>
  )
}

export default Home
