import React from 'react';
import { useParams } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';

const JobApplicationPage = () => {
  const { id } = useParams();

  return (
    <section className='bg-indigo-50'>
      <div className='container m-auto max-w-2xl py-24'>
        <ApplicationForm jobId={id} />
        <button
          className="inline-block bg-indigo-500 text-white rounded-lg px-4 py-2 hover:bg-indigo-600"
          type="submit"
        >
          Submit Application
        </button>
      </div>
    </section>
  );
};

export default JobApplicationPage;