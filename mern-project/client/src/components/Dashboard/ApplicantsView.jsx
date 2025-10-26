import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Mail, Phone, MapPin, FileText, ExternalLink } from 'lucide-react';
import api from '../../api/api';

const ApplicantsView = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      console.log('Fetching applicants for job:', jobId);
      const response = await api.get(`/recruiter/jobs/${jobId}/applicants`);
      console.log('Applicants response:', response.data);
      setApplicants(response.data.applicants || []);
      // Also fetch job details
      const jobResponse = await api.get(`/jobs/${jobId}`);
      setJob(jobResponse.data.jobPost);
    } catch (err) {
      console.error('Failed to fetch applicants', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (seekerId, status) => {
    try {
      await api.put(`/recruiter/jobs/${jobId}/applicants/${seekerId}/status`, { status });
      // Refresh applicants
      fetchApplicants();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Job Applicants</h1>
          {job && (
            <p className="text-muted-foreground mt-1">
              {job.title} at {job.company}
            </p>
          )}
        </div>
      </div>

      {applicants.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applicants.map((applicant) => (
            <Card key={applicant.seekerId._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{applicant.seekerId.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {applicant.seekerId.email}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      applicant.status === 'hired' ? 'default' :
                      applicant.status === 'rejected' ? 'destructive' :
                      applicant.status === 'shortlisted' ? 'secondary' : 'outline'
                    }
                  >
                    {applicant.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{applicant.seekerId.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{applicant.seekerId.location || 'Not provided'}</span>
                  </div>
                </div>

                {applicant.seekerId.skills && applicant.seekerId.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {applicant.seekerId.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {applicant.resumeUrl && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Resume</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(applicant.resumeUrl, '_blank')}
                      className="w-full justify-start"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Resume
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Applied on {new Date(applicant.appliedAt).toLocaleDateString()}</span>
                </div>

                <div className="pt-4 border-t">
                  <label className="text-sm font-medium mb-2 block">Update Status</label>
                  <div className="flex gap-2">
                    <Select
                      value={applicant.status}
                      onValueChange={(value) => updateApplicationStatus(applicant.seekerId._id, value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No applicants yet</h3>
            <p className="text-muted-foreground">
              Applicants will appear here once candidates apply for this job.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicantsView;