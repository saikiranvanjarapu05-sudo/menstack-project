import React, { useContext } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Building, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const JobCard = ({ job }) => {
  const { user } = useContext(AuthContext);
  const isApplied = user?.appliedJobs?.some(app => app.jobId === job._id);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{job.company}</span>
            </div>
          </div>
          {isApplied && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Applied
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description?.substring(0, 120)}...
          </p>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Link to={`/jobs/${job._id}`} className="w-full">
          <Button className="w-full" disabled={isApplied}>
            {isApplied ? 'Already Applied' : 'View Details'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default JobCard;