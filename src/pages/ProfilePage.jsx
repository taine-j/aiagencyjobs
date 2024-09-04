import React from 'react'
import Profile from '../components/Profile'
import UserJobListings from '../components/UserJobListings'

const ProfilePage = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto max-w-4xl">
        <Profile />
      </div>
    </div>
  )
}

export default ProfilePage