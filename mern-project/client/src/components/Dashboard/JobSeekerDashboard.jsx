import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, XCircle, Eye, Bell } from 'lucide-react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

const JobSeekerDashboard = () => {
  const { user } = React.useContext(AuthContext);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    reviewing: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch applied jobs
        const response = await api.get('/jobseeker/applied-jobs');
        const jobs = response.data.appliedJobs || [];
        setAppliedJobs(jobs);

        // Calculate stats
        const stats = jobs.reduce((acc, job) => {
          acc.total++;
          acc[job.status] = (acc[job.status] || 0) + 1;
          return acc;
        }, {
          total: 0,
          applied: 0,
          reviewing: 0,
          shortlisted: 0,
          rejected: 0,
          hired: 0
        });
        setStats(stats);

        // Fetch notifications
        if (user?.id) {
          const profileResponse = await api.get('/auth/me');
          setNotifications(profileResponse.data.user?.notifications || []);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'reviewing': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'shortlisted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'hired': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'applied': return 'secondary';
      case 'reviewing': return 'default';
      case 'shortlisted': return 'default';
      case 'rejected': return 'destructive';
      case 'hired': return 'default';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's an overview of your job applications</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative"
        >
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {notifications.filter(n => !n.read).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg border ${
                      notification.read ? 'bg-muted/50' : 'bg-green-50 dark:bg-green-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // Mark as read locally
                            setNotifications(prev =>
                              prev.map(notif =>
                                notif._id === notification._id ? { ...notif, read: true } : notif
                              )
                            );
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No notifications yet
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Applied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.applied}</div>
            <div className="text-sm text-muted-foreground">Applied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.reviewing}</div>
            <div className="text-sm text-muted-foreground">Reviewing</div>
          </CardContent>
        </Card>
        <Card className={stats.shortlisted > 0 ? "ring-2 ring-green-500 ring-opacity-50" : ""}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.shortlisted}</div>
            <div className="text-sm text-muted-foreground">Shortlisted</div>
            {stats.shortlisted > 0 && (
              <div className="mt-2">
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.hired}</div>
            <div className="text-sm text-muted-foreground">Hired</div>
          </CardContent>
        </Card>
      </div>

      {/* Applied Jobs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Applications</h2>
          <Link to="/jobs">
            <Button>
              <Briefcase className="mr-2 h-4 w-4" />
              Browse More Jobs
            </Button>
          </Link>
        </div>

        {appliedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appliedJobs.map((application) => (
              <Card key={application._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg line-clamp-2">
                        {application.jobId?.title || 'Job Title'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{application.jobId?.company || 'Company'}</span>
                        <span>•</span>
                        <span>{application.jobId?.location || 'Location'}</span>
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(application.status)} className="flex items-center gap-1">
                      {getStatusIcon(application.status)}
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>Applied: {new Date(application.appliedAt).toLocaleDateString()}</div>
                    {application.jobId?.salary && (
                      <div className="font-medium text-green-600 dark:text-green-400">
                        ${application.jobId.salary}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your job search by browsing available positions
              </p>
              <Link to="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobSeekerDashboard;