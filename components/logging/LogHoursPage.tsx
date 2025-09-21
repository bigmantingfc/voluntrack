
import React from 'react';
import LogHoursForm from './LogHoursForm';

const LogHoursPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 mt-16"> {/* Added mt-16 for navbar offset */}
      <div className="max-w-xl mx-auto mt-8">
        <div className="bg-white p-8 shadow-xl rounded-lg">
          <h1 className="text-3xl font-bold text-primary mb-6 text-center">Log Your Volunteer Hours</h1>
          <p className="text-gray-600 mb-6 text-center">
            Record your contributions and track your impact. Every hour makes a difference!
          </p>
          <LogHoursForm />
        </div>
      </div>
    </div>
  );
};

export default LogHoursPage;