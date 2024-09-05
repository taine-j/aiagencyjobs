import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ApplicationForm = ({ jobId }) => {
  const [message, setMessage] = useState('');
  const [skills, setSkills] = useState('');
  const [projectLinks, setProjectLinks] = useState('');
  const [cv, setCv] = useState(null);
  const [supportingDocs, setSupportingDocs] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('job', jobId);
    formData.append('message', message);
    formData.append('skills', skills);
    formData.append('projectLinks', projectLinks);
    if (cv) {
      console.log('Appending CV:', cv.name, cv.type, cv.size);
      formData.append('cv', cv);
    }
    if (supportingDocs) {
      console.log('Appending supporting docs:', supportingDocs.name, supportingDocs.type, supportingDocs.size);
      formData.append('supportingDocs', supportingDocs);
    }

    console.log('Form data:', Array.from(formData.entries()));

    try {
      const response = await axios.post('/api/job-applications', formData, {
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
      console.error('Error submitting application:', error);
      console.log('Response data:', error.response?.data);
      console.log('Response status:', error.response?.status);
      console.log('Response headers:', error.response?.headers);
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

        <div className='mb-4'>
          <label htmlFor="supportingDocs" className="block text-gray-700 font-bold mb-2">
            Supporting Documents
          </label>
          <input
            type="file"
            id="supportingDocs"
            name="supportingDocs"
            className="border rounded w-full py-2 px-3"
            onChange={(e) => setSupportingDocs(e.target.files[0])}
          />
        </div>

        <div>
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;