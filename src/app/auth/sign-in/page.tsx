import React, { Suspense } from 'react'
import Client from './client'

const Page = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Client />
    </Suspense>
  )
}

export default Page
