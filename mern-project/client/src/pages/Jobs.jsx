import React from 'react';
import JobList from '../components/Job/JobList';

const Jobs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <JobList />
      </div>
    </div>
  );
};

export default Jobs;