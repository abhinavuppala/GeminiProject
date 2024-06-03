'use client'
import Image from "next/image";
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown';



export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-between p-24">
      <div className="h-full z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex-col space-y-16">
          Landing page to be designed by kyle 
      </div>
    </main>
  )
}
