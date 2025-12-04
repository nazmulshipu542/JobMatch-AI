import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MockBackend } from '../services/mockBackend';
import { GeminiService } from '../services/geminiService';
import { useAuth } from '../App';
import { Job } from '../types';
import { CheckCircle, AlertCircle, Briefcase, MapPin, Loader2 } from 'lucide-react';

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);
  const [matchResult, setMatchResult] = useState<{score: number, analysis: string} | null>(null);

  useEffect(() => {
    if (id) {
      const foundJob = MockBackend.getJobById(id);
      setJob(foundJob || null);
    }
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user.role === 'employer') {
        alert("Employers cannot apply to jobs.");
        return;
    }
    if (!user.resumeText) {
      alert("Please upload your resume in your dashboard before applying.");
      navigate('/dashboard');
      return;
    }
    if (!job) return;

    setApplying(true);

    // 1. AI Analysis
    const analysis = await GeminiService.analyzeResumeMatch(user.resumeText, job.description + " " + job.requirements.join(", "));

    // 2. Create Application
    const newApp = {
      id: `app_${Date.now()}`,
      jobId: job.id,
      candidateId: user.id,
      candidateName: user.name,
      appliedAt: new Date().toISOString(),
      status: 'pending' as const,
      aiMatchScore: analysis.matchScore,
      aiAnalysis: analysis.analysis,
      missingSkills: analysis.missingSkills
    };

    MockBackend.addApplication(newApp);
    setMatchResult({ score: analysis.matchScore, analysis: analysis.analysis });
    setApplying(false);
  };

  if (!job) return <div className="text-center py-20">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="text-xl text-indigo-600 font-medium mb-4">{job.company}</div>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location}</span>
              <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> {job.type}</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{job.salaryRange}</span>
            </div>
          </div>
        </div>

        <div className="prose max-w-none text-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="whitespace-pre-line mb-6">{job.description}</p>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
          <ul className="list-disc pl-5 space-y-1">
            {job.requirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>

        <hr className="my-6 border-gray-200" />

        <div className="flex flex-col items-center">
            {matchResult ? (
                <div className="w-full bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-gray-800">Application Sent!</h3>
                    <div className="mt-4">
                        <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">AI Match Score</div>
                        <div className={`text-4xl font-bold ${matchResult.score > 70 ? 'text-green-600' : matchResult.score > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {matchResult.score}%
                        </div>
                    </div>
                    <p className="mt-2 text-gray-600 italic">"{matchResult.analysis}"</p>
                    <button onClick={() => navigate('/jobs')} className="mt-6 text-indigo-600 font-medium hover:underline">
                        Back to Jobs
                    </button>
                </div>
            ) : (
                <div className="w-full text-center">
                    {user?.role === 'candidate' || !user ? (
                        <>
                            <p className="text-gray-500 mb-4 text-sm">
                                Clicking Apply will analyze your resume against this job description using AI.
                            </p>
                            <button 
                                onClick={handleApply} 
                                disabled={applying}
                                className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {applying ? <><Loader2 className="animate-spin" /> Analyzing & Applying...</> : 'Apply Now with AI Match'}
                            </button>
                        </>
                    ) : (
                        <div className="bg-gray-100 p-4 rounded text-gray-600">
                             Log in as a candidate to apply.
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}