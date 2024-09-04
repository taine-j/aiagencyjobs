import React from 'react';
import { useParams } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';

const JobApplicationPage = () => {
  const { id } = useParams();

  return (
    <section className='bg-indigo-50'>
      <div className='container m-auto max-w-2xl py-24'>
        <ApplicationForm jobId={id} />
      </div>
    </section>
  );
};

export default JobApplicationPage;