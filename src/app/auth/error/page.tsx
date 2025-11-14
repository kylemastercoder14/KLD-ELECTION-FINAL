import React, { Suspense } from 'react'
import AuthError from './client'

const Page = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthError />
    </Suspense>
  )
}

export default Page
