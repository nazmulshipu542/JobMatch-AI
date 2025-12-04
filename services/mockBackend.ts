import { User, Job, Application } from '../types';

// Initial Mock Data
const INITIAL_JOBS: Job[] = [
  {
    id: 'job_1',
    employerId: 'emp_1',
    employerName: 'TechCorp Solutions',
    title: 'Senior React Developer',
    company: 'TechCorp Solutions',
    location: 'Remote',
    type: 'Full-time',
    salaryRange: '$120k - $150k',
    description: 'We are looking for a Senior React Developer to join our core product team. You will be building scalable frontend applications using React, TypeScript, and Tailwind CSS.',
    requirements: ['5+ years JavaScript', '3+ years React', 'TypeScript expertise', 'Experience with AWS', 'Bachelor degree in CS'],
    postedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'job_2',
    employerId: 'emp_1',
    employerName: 'TechCorp Solutions',
    title: 'Backend Engineer (Node.js)',
    company: 'TechCorp Solutions',
    location: 'New York, NY',
    type: 'Full-time',
    salaryRange: '$130k - $160k',
    description: 'Join our backend team to build high-performance APIs. You will work with Node.js, Express, and PostgreSQL.',
    requirements: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Microservices architecture'],
    postedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'job_3',
    employerId: 'emp_2',
    employerName: 'Creative Design Studio',
    title: 'UI/UX Designer',
    company: 'Creative Design Studio',
    location: 'London, UK',
    type: 'Contract',
    salaryRange: '$80/hr',
    description: 'We need a creative designer to revamp our mobile app interface. Experience with Figma is a must.',
    requirements: ['Figma', 'Adobe Creative Suite', 'Mobile App Design', 'Prototyping'],
    postedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export const MockBackend = {
  getJobs: (): Job[] => {
    const stored = localStorage.getItem('jobs');
    if (!stored) {
      localStorage.setItem('jobs', JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    return JSON.parse(stored);
  },

  addJob: (job: Job) => {
    const jobs = MockBackend.getJobs();
    jobs.unshift(job);
    localStorage.setItem('jobs', JSON.stringify(jobs));
  },

  getJobById: (id: string): Job | undefined => {
    const jobs = MockBackend.getJobs();
    return jobs.find(j => j.id === id);
  },

  getApplications: (): Application[] => {
    const stored = localStorage.getItem('applications');
    return stored ? JSON.parse(stored) : [];
  },

  addApplication: (app: Application) => {
    const apps = MockBackend.getApplications();
    apps.push(app);
    localStorage.setItem('applications', JSON.stringify(apps));
  },

  getApplicationsByJobId: (jobId: string): Application[] => {
    return MockBackend.getApplications().filter(a => a.jobId === jobId);
  },

  getApplicationsByCandidateId: (candidateId: string): Application[] => {
    return MockBackend.getApplications().filter(a => a.candidateId === candidateId);
  },

  updateUser: (user: User) => {
     // In a real app, this would update the user in the DB. 
     // Here we just ensure if the current user updates profile, it might persist if we tracked a user list.
     // For this demo, we mainly use the AuthContext + localStorage('currentUser').
  }
};