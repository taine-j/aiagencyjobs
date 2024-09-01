import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const SignUpCompanyPage = () => {

const [companyName, setCompanyName] = useState('');
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [agreeToTerms, setAgreeToTerms] = useState(false);

const navigate = useNavigate();

const submitForm = (e) => {
  e.preventDefault();

  const newCompany = {
    companyName,
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    agreeToTerms,
  }
}

  return (
    <section className='bg-indigo-50'>
    <div className='container m-auto max-w-2xl py-24'>
      <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0'>
        <form onSubmit={submitForm}>
          <h2 className='text-3xl text-center font-semibold mb-6'>Register Company</h2>

          <div className='mb-4'>
            <label
              htmlFor='company'
              className='block text-gray-700 font-bold mb-2'
            >
              Company Name
            </label>
            <input
              type='text'
              id='company'
              name='company'
              className='border rounded w-full py-2 px-3'
              placeholder='Company Name'
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='first_name'
              className='block text-gray-700 font-bold mb-2'
            >
              First Name
            </label>
            <input
              type='text'
              id='first_name'
              name='first_name'
              className='border rounded w-full py-2 px-3'
              placeholder='First Name'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='last_name'
              className='block text-gray-700 font-bold mb-2'
            >
              Last Name
            </label>
            <input
              type='text'
              id='last_name'
              name='last_name'
              className='border rounded w-full py-2 px-3'
              placeholder='Last Name'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='email'
              className='block text-gray-700 font-bold mb-2'
            >
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              className='border rounded w-full py-2 px-3'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='password'
              className='block text-gray-700 font-bold mb-2'
            >
              Password
            </label>
            <input
              type='password'
              id='password'
              name='password'
              className='border rounded w-full py-2 px-3'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='confirm_password'
              className='block text-gray-700 font-bold mb-2'
            >
              Confirm Password
            </label>
            <input
              type='password'
              id='confirm_password'
              name='confirm_password'
              className='border rounded w-full py-2 px-3'
              placeholder='Confirm Password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className='mb-4'>
            <label className='block text-gray-700 font-bold mb-2'>
              <input
                type='checkbox'
                id='agree_to_terms'
                name='agree_to_terms'
                className='mr-2 leading-tight'
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              I agree to the terms of service
            </label>
          </div>

          <div>
            <button
              className='bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline'
              type='submit'
            >
              Register Company
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
  )
}

export default SignUpCompanyPage