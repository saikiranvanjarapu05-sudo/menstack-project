import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import ApplyJobModal from '../ApplyJobModal';
import { MapPin, DollarSign, Building, Calendar, Users, CheckCircle, User } from 'lucide-react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = React.useContext(AuthContext);
  const isApplied = user?.appliedJobs?.some(app => app.jobId === id);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data.jobPost);
      } catch (err) {
        console.error('Failed to fetch job', err);
      }
    };
    fetchJob();
  }, [id]);

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <Building className="h-4 w-4" />
                    {job.company}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{job.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <DollarSign className="h-4 w-4" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Posted recently</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{job.applications?.length || 0} applicants</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>
            </CardContent>
          </Card>

          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {job.skills && job.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {user?.role === 'jobseeker' && (
            <Card>
              <CardContent className="pt-6">
                {isApplied ? (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-green-600 dark:text-green-400 mb-2">
                      Already Applied
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have already applied for this position
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowModal(true)}
                    className="w-full"
                    size="lg"
                  >
                    Apply Now
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {user?.role === 'recruiter' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Building className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-2">
                    Recruiter View
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can view job details but cannot apply. Use the dashboard to manage your job postings.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job Type</span>
                <span className="font-medium">{job.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{job.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-medium text-green-600 dark:text-green-400">{job.salary}</span>
              </div>
              {job.experience && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">{job.experience}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showModal && <ApplyJobModal jobId={id} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default JobDetail;