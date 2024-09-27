import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ApplicationForm = ({ jobId }) => {
  const [message, setMessage] = useState('');
  const [skills, setSkills] = useState('');
  const [projectLinks, setProjectLinks] = useState('');
  const [cv, setCv] = useState(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Function to remove whitespaces from file name
  const sanitizeFileName = (fileName) => {
    return fileName.replace(/\s+/g, '_');
  };

  // Function to create a new file with sanitized name
  const createFileWithSanitizedName = (file) => {
    const sanitizedName = sanitizeFileName(file.name);
    return new File([file], sanitizedName, { type: file.type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('job', jobId);
    formData.append('message', message);
    formData.append('skills', skills);
    formData.append('projectLinks', projectLinks);
    formData.append('phone', phone);
    formData.append('email', email);
    
    if (cv) {
      const sanitizedCv = createFileWithSanitizedName(cv);
      console.log('Appending CV:', sanitizedCv.name, sanitizedCv.type, sanitizedCv.size);
      formData.append('cv', sanitizedCv);
    }

    console.log('Form data:', Array.from(formData.entries()));

    try {
      const response = await axios.post(`${API_BASE_URL}/job-applications`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.status === 201) {
        toast.success('Application submitted successfully');
        navigate('/jobs');
      } else {
        toast.error(response.data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        toast.error(error.response.data.error || 'An error occurred while submitting your application');
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response received from the server');
      } else {
        console.error('Error setting up request:', error.message);
        toast.error('An error occurred while setting up the request');
      }
    }
  };

  return (
    <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0'>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className='text-3xl text-center font-semibold mb-6'>Apply for Job</h2>

        <div className='mb-4'>
          <label htmlFor="message" className="block text-gray-700 font-bold mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows="4"
            className="border rounded w-full py-2 px-3"
            placeholder="Introduce yourself and explain why you're a good fit for this job"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>

        <div className='mb-4'>
          <label htmlFor="skills" className="block text-gray-700 font-bold mb-2">
            Skills
          </label>
          <input
            type="text"
            id="skills"
            name="skills"
            className="border rounded w-full py-2 px-3"
            placeholder="List your relevant skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            required
          />
        </div>

        <div className='mb-4'>
          <label htmlFor="projectLinks" className="block text-gray-700 font-bold mb-2">
            Project Links
          </label>
          <input
            type="text"
            id="projectLinks"
            name="projectLinks"
            className="border rounded w-full py-2 px-3"
            placeholder="Links to your relevant projects (optional)"
            value={projectLinks}
            onChange={(e) => setProjectLinks(e.target.value)}
          />
        </div>

        <div className='mb-4'>
          <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="border rounded w-full py-2 px-3"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className='mb-4'>
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="border rounded w-full py-2 px-3"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className='mb-4'>
          <label htmlFor="cv" className="block text-gray-700 font-bold mb-2">
            CV
          </label>
          <input
            type="file"
            id="cv"
            name="cv"
            className="border rounded w-full py-2 px-3"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file && file.type === 'application/pdf') {
                setCv(file);
              } else {
                toast.error('Please upload a PDF file for your CV');
              }
            }}
            accept=".pdf"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-blue-900 text-white rounded-lg px-4 py-2 hover:bg-blue-800"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;