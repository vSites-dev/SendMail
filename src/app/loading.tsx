import { Loader2 } from 'lucide-react'
import React from 'react'

export default function Loading() {
  return (
    <div className='w-screen h-screen flex items-center justify-center bg-background'>
      <Loader2 className='size-10 text-primary animate-spin' />
    </div>
  )
}
