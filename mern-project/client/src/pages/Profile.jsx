import React, { useState, useEffect, useContext } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Briefcase, Edit, Save, X } from 'lucide-react';
import api from '../api/api';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      const response = await api.put('/auth/profile', profile);
      setProfile(response.data);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Please login to view your profile</h3>
            <p className="text-muted-foreground">You need to be logged in to access your profile information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>{profile.name || 'User'}</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className="mt-2">
                  {profile.role === 'jobseeker' ? 'Job Seeker' : 'Recruiter'}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                {profile.role === 'jobseeker' && (
                  <div className="flex items-center justify-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{profile.skills ? `${profile.skills.split(',').length} skills` : 'No skills listed'}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and preferences
                  </CardDescription>
                </div>
                <Button
                  variant={editing ? "default" : "outline"}
                  size="sm"
                  onClick={() => editing ? setEditing(false) : setEditing(true)}
                >
                  {editing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={profile.name || ''}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </p>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {profile.role === 'jobseeker' ? 'Job Seeker' : 'Recruiter'}
                    </Badge>
                  </div>
                </div>

                {profile.role === 'jobseeker' && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="skills">Skills & Expertise</Label>
                    {editing ? (
                      <Input
                        id="skills"
                        value={profile.skills || ''}
                        onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                        placeholder="e.g. JavaScript, React, Node.js"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills ? (
                          profile.skills.split(',').map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill.trim()}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No skills listed</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {editing && (
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;