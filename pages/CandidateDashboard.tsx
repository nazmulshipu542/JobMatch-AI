import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { extractTextFromPdf } from '../utils/pdfParser';
import { MockBackend } from '../services/mockBackend';
import { Application } from '../types';
import { UploadCloud, FileText, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

export function CandidateDashboard() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [myApplications, setMyApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (user) {
      const apps = MockBackend.getApplicationsByCandidateId(user.id);
      setMyApplications(apps.reverse());
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF.');
      return;
    }

    setUploading(true);
    try {
      // 1. Parse locally
      const text = await extractTextFromPdf(file);
      
      // 2. Update User Profile
      updateUser({
        resumeText: text,
        resumeFileName: file.name
      });
      alert('Resume processed and saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to parse PDF. Please ensure it is a valid text-based PDF.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile & Resume</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative">
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf"
                    disabled={uploading}
                />
                <UploadCloud className={`w-12 h-12 mb-3 ${uploading ? 'text-gray-400' : 'text-indigo-500'}`} />
                <p className="text-lg font-medium text-gray-700">
                    {uploading ? 'Processing PDF...' : 'Upload New Resume'}
                </p>
                <p className="text-sm text-gray-500 mt-1">PDF files only</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold">Current Resume</h3>
                </div>
                {user.resumeFileName ? (
                    <div>
                        <p className="font-medium text-gray-800">{user.resumeFileName}</p>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Processed for AI Matching
                        </p>
                        <div className="mt-4 p-3 bg-white border rounded text-xs text-gray-500 h-32 overflow-y-auto font-mono">
                            {user.resumeText?.slice(0, 300)}...
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No resume uploaded yet. Upload one to start applying.</p>
                )}
            </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Applications</h2>
        {myApplications.length === 0 ? (
            <p className="text-gray-500">You haven't applied to any jobs yet.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Score</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {myApplications.map((app) => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                    <a href={`#/jobs/${app.jobId}`}>View Job</a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(app.appliedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${app.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                          app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                          'bg-yellow-100 text-yellow-800'}`}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center">
                                        <div className={`font-bold mr-2 ${
                                            (app.aiMatchScore || 0) >= 70 ? 'text-green-600' : 
                                            (app.aiMatchScore || 0) >= 40 ? 'text-yellow-600' : 'text-red-500'
                                        }`}>
                                            {app.aiMatchScore}%
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}