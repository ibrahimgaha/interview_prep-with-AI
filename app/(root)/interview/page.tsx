import Agent from '@/components/Agent'
import { getCurrentUser } from '@/lib/actions/auth.action';
import React from 'react'

const page = async () => {
const user = await getCurrentUser();

  return (
    <>
       <div className="flex flex-col gap-6">
         <div className="text-center">
           <h3 className="text-2xl font-bold mb-2">AI Interview Generation</h3>
           <p className="text-gray-600">
             Start a conversation with our AI to generate personalized interview questions.
             The AI will ask you about:
           </p>
           <ul className="text-gray-600 text-left max-w-md mx-auto mt-2 space-y-1">
             <li>• Your target role (e.g., Frontend Developer, Backend Developer)</li>
             <li>• Experience level (Junior, Mid, Senior)</li>
             <li>• Interview type (Technical, Behavioral, Mixed)</li>
             <li>• Number of questions you want</li>
             <li>• Your tech stack (React, Node.js, Python, etc.)</li>
           </ul>
         </div>

         <Agent userName={user?.name || 'User'} userId={user?.uid} type="generate"/>
       </div>
    </>
  )
}

export default page
