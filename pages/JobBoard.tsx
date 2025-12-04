import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MockBackend } from '../services/mockBackend';
import { Job } from '../types';
import { MapPin, Building, Clock, DollarSign } from 'lucide-react';

export function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setJobs(MockBackend.getJobs());
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(filter.toLowerCase()) || 
    job.company.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Job Openings</h2>
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search jobs by title or company..."
            className="w-full px-5 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
            <p className="text-center text-gray-500">No jobs found matching your criteria.</p>
        ) : (
            filteredJobs.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="block group">
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 group-hover:border-indigo-200">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                        <Building className="w-4 h-4 mr-1" /> {job.company}
                        </div>
                        <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" /> {job.location}
                        </div>
                        <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" /> {job.type}
                        </div>
                        <div className="flex items-center text-green-600 font-medium">
                        <DollarSign className="w-4 h-4 mr-1" /> {job.salaryRange}
                        </div>
                    </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-end">
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full mb-2">
                        {new Date(job.postedAt).toLocaleDateString()}
                    </span>
                    <span className="text-indigo-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        View Details &rarr;
                    </span>
                    </div>
                </div>
                </div>
            </Link>
            ))
        )}
      </div>
    </div>
  );
}