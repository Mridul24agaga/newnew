'use client'

import Link from 'next/link'
import { StarfieldBackground } from '@/app/components/StarfieldBackground'
import { CheckCircle, ArrowLeft } from 'lucide-react'

export default function ThankYou() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <StarfieldBackground />
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-[24px] shadow-2xl text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">Thank You for Subscribing!</h1>
          <p className="text-gray-200 mb-8">
            Your subscription has been confirmed. We're excited to share valuable insights with you!
          </p>
          <Link 
            href="/"
            className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-lg font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Home
          </Link>
          <div className="mt-8 text-gray-300 text-lg font-medium">
            Mridul Thareja
          </div>
        </div>
      </div>
    </div>
  )
}

