import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { MockBackend } from '../services/mockBackend';
import { Job, Application } from '../types';
import { PlusCircle, Users, BarChart } from 'lucide-react';

export function EmployerDashboard() {
  const { user } = useAuth();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', type: 'Full-time',
    salaryRange: '', description: '', requirements: ''
  });

  useEffect(() => {
    if (user) {
      const allJobs = MockBackend.getJobs();
      const myJobs = allJobs.filter(j => j.employerId === user.id);
      setPostedJobs(myJobs);
    }
  }, [user, showPostForm]); // Refresh when form toggles (after submit)

  useEffect(() => {
    if (selectedJobId) {
      const apps = MockBackend.getApplicationsByJobId(selectedJobId);
      // Sort by AI Match Score desc
      apps.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
      setApplicants(apps);
    } else {
      setApplicants([]);
    }
  }, [selectedJobId]);

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const newJob: Job = {
        id: `job_${Date.now()}`,
        employerId: user.id,
        employerName: user.name,
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type as any,
        salaryRange: formData.salaryRange,
        description: formData.description,
        requirements: formData.requirements.split('\n').filter(r => r.trim() !== ''),
        postedAt: new Date().toISOString()
    };

    MockBackend.addJob(newJob);
    setShowPostForm(false);
    setFormData({ title: '', company: '', location: '', type: 'Full-time', salaryRange: '', description: '', requirements: '' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
        <button 
          onClick={() => setShowPostForm(!showPostForm)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          {showPostForm ? 'Cancel' : 'Post New Job'}
        </button>
      </div>

      {showPostForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-indigo-500">
            <h3 className="text-xl font-semibold mb-4">Create Job Listing</h3>
            <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Job Title" className="border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <input required placeholder="Company Name" className="border p-2 rounded" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                <input required placeholder="Location" className="border p-2 rounded" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                <select className="border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Remote</option>
                </select>
                <input required placeholder="Salary Range (e.g. $100k - $120k)" className="border p-2 rounded" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} />
                <div className="md:col-span-2">
                    <textarea required placeholder="Job Description" rows={4} className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                    <textarea required placeholder="Requirements (One per line)" rows={4} className="w-full border p-2 rounded" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                </div>
                <button type="submit" className="md:col-span-2 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">Publish Job</button>
            </form>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Jobs List */}
        <div className="md:col-span-1 space-y-4">
            <h3 className="font-semibold text-gray-700">Your Posted Jobs</h3>
            {postedJobs.length === 0 && <p className="text-gray-500 italic">No jobs posted yet.</p>}
            {postedJobs.map(job => (
                <div 
                    key={job.id} 
                    onClick={() => setSelectedJobId(job.id)}
                    className={`p-4 rounded-lg cursor-pointer border transition-colors ${selectedJobId === job.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                >
                    <h4 className="font-bold text-gray-800">{job.title}</h4>
                    <p className="text-sm text-gray-500">{new Date(job.postedAt).toLocaleDateString()}</p>
                    <div className="flex items-center text-xs text-indigo-600 mt-2 font-medium">
                        <Users className="w-3 h-3 mr-1" /> View Applicants
                    </div>
                </div>
            ))}
        </div>

        {/* Applicants List */}
        <div className="md:col-span-2 bg-white rounded-lg shadow min-h-[400px] p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-indigo-600" />
                Applicants Analysis {selectedJobId ? `(${applicants.length})` : ''}
            </h3>
            
            {!selectedJobId ? (
                <div className="text-center text-gray-400 py-20">Select a job to view applicants</div>
            ) : applicants.length === 0 ? (
                <div className="text-center text-gray-400 py-20">No applicants yet.</div>
            ) : (
                <div className="space-y-4">
                    {applicants.map(app => (
                        <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800">{app.candidateName}</h4>
                                    <p className="text-xs text-gray-500">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 uppercase text-xs font-semibold">Match Score</div>
                                    <div className={`text-2xl font-bold ${
                                        (app.aiMatchScore || 0) > 80 ? 'text-green-600' : 
                                        (app.aiMatchScore || 0) > 50 ? 'text-yellow-600' : 'text-red-500'
                                    }`}>
                                        {app.aiMatchScore}%
                                    </div>
                                </div>
                            </div>
                            
                            {/* AI Analysis Summary */}
                            <div className="mt-3 bg-gray-50 p-3 rounded text-sm text-gray-700">
                                <p className="font-medium text-indigo-800 text-xs uppercase mb-1">AI Summary</p>
                                <p>{app.aiAnalysis}</p>
                            </div>
                            
                            {app.missingSkills && app.missingSkills.length > 0 && (
                                <div className="mt-2">
                                    <span className="text-xs font-semibold text-red-500 mr-2">Missing Skills:</span>
                                    {app.missingSkills.map(skill => (
                                        <span key={skill} className="inline-block bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded mr-1 mb-1">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 flex gap-2">
                                <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">View Resume</button>
                                <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Contact Candidate</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}