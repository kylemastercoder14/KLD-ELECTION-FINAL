'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  IconSettings, 
  IconBell, 
  IconShield, 
  IconDatabase, 
  IconMail, 
  IconCalendar,
  IconUsers,
  IconKey
} from '@tabler/icons-react';
import { toast } from 'sonner';

const Page = () => {
  // System Configuration State
  const [systemName, setSystemName] = useState('KLD Election Management System');
  const [systemDescription, setSystemDescription] = useState('Comprehensive Election Management Platform');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);

  // Election Settings State
  const [defaultCampaignDuration, setDefaultCampaignDuration] = useState('7');
  const [defaultElectionDuration, setDefaultElectionDuration] = useState('3');
  const [requireApproval, setRequireApproval] = useState(true);
  const [allowAbstain, setAllowAbstain] = useState(false);
  const [maxCandidatesPerPosition, setMaxCandidatesPerPosition] = useState('10');

  // Security Settings State
  const [minPasswordLength, setMinPasswordLength] = useState('8');
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);

  // Backup Settings State
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [retentionDays, setRetentionDays] = useState('30');
  const [backupLocation, setBackupLocation] = useState('/backups');

  // Email Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notifyElectionStart, setNotifyElectionStart] = useState(true);
  const [notifyElectionEnd, setNotifyElectionEnd] = useState(true);
  const [notifyNewCandidate, setNotifyNewCandidate] = useState(true);
  const [notifyResults, setNotifyResults] = useState(true);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpEmail, setSmtpEmail] = useState('');

  // User Management Settings State
  const [autoApproveStudents, setAutoApproveStudents] = useState(false);
  const [autoApproveFaculty, setAutoApproveFaculty] = useState(false);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [defaultUserRole, setDefaultUserRole] = useState('USER');

  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async (section: string) => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(`${section} settings saved successfully!`);
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure and manage your election management system</p>
        </div>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <IconSettings className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="election" className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4" />
            <span className="hidden sm:inline">Elections</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <IconShield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <IconDatabase className="h-4 w-4" />
            <span className="hidden sm:inline">Backup</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <IconMail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <IconBell className="h-4 w-4" />
            <span className="hidden sm:inline">Notify</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <IconUsers className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
        </TabsList>

        {/* System Configuration */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSettings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                General system settings and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    placeholder="Enter system name"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be displayed as the main title across the system
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemDescription">System Description</Label>
                  <Input
                    id="systemDescription"
                    value={systemDescription}
                    onChange={(e) => setSystemDescription(e.target.value)}
                    placeholder="Enter system description"
                  />
                  <p className="text-xs text-muted-foreground">
                    Brief description of your election management system
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Temporarily disable access to the system for maintenance
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowRegistration">Allow Public Registration</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable users to register for new accounts
                    </p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={allowRegistration}
                    onCheckedChange={setAllowRegistration}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('System')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Election Settings */}
        <TabsContent value="election">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCalendar className="h-5 w-5" />
                Election Settings
              </CardTitle>
              <CardDescription>
                Configure default settings for elections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaignDuration">Default Campaign Duration (Days)</Label>
                    <Input
                      id="campaignDuration"
                      type="number"
                      value={defaultCampaignDuration}
                      onChange={(e) => setDefaultCampaignDuration(e.target.value)}
                      min="1"
                      max="30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Default number of days for campaign period
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="electionDuration">Default Election Duration (Days)</Label>
                    <Input
                      id="electionDuration"
                      type="number"
                      value={defaultElectionDuration}
                      onChange={(e) => setDefaultElectionDuration(e.target.value)}
                      min="1"
                      max="14"
                    />
                    <p className="text-xs text-muted-foreground">
                      Default number of days for voting period
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxCandidates">Max Candidates per Position</Label>
                  <Input
                    id="maxCandidates"
                    type="number"
                    value={maxCandidatesPerPosition}
                    onChange={(e) => setMaxCandidatesPerPosition(e.target.value)}
                    min="1"
                    max="50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of candidates allowed per position
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireApproval">Require Candidate Approval</Label>
                    <p className="text-xs text-muted-foreground">
                      Candidates must be approved before appearing on ballot
                    </p>
                  </div>
                  <Switch
                    id="requireApproval"
                    checked={requireApproval}
                    onCheckedChange={setRequireApproval}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowAbstain">Allow Abstain Option</Label>
                    <p className="text-xs text-muted-foreground">
                      Voters can choose to abstain from voting for a position
                    </p>
                  </div>
                  <Switch
                    id="allowAbstain"
                    checked={allowAbstain}
                    onCheckedChange={setAllowAbstain}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('Election')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconShield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPassword">Minimum Password Length</Label>
                    <Input
                      id="minPassword"
                      type="number"
                      value={minPasswordLength}
                      onChange={(e) => setMinPasswordLength(e.target.value)}
                      min="6"
                      max="32"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum characters required for passwords
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={maxLoginAttempts}
                      onChange={(e) => setMaxLoginAttempts(e.target.value)}
                      min="3"
                      max="10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Account locked after this many failed attempts
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    min="15"
                    max="1440"
                  />
                  <p className="text-xs text-muted-foreground">
                    Inactive users will be logged out after this duration
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireSpecialChar">Require Special Characters</Label>
                    <p className="text-xs text-muted-foreground">
                      Passwords must contain at least one special character
                    </p>
                  </div>
                  <Switch
                    id="requireSpecialChar"
                    checked={requireSpecialChar}
                    onCheckedChange={setRequireSpecialChar}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">
                      Require 2FA for admin and superadmin accounts
                    </p>
                  </div>
                  <Switch
                    id="enableTwoFactor"
                    checked={enableTwoFactor}
                    onCheckedChange={setEnableTwoFactor}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('Security')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconDatabase className="h-5 w-5" />
                Backup Settings
              </CardTitle>
              <CardDescription>
                Configure automated backup and data retention policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoBackup">Automatic Backups</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable scheduled automatic database backups
                    </p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>

                {autoBackup && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <select
                        id="backupFrequency"
                        value={backupFrequency}
                        onChange={(e) => setBackupFrequency(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="hourly">Every Hour</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        How often to perform automatic backups
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retentionDays">Retention Period (Days)</Label>
                      <Input
                        id="retentionDays"
                        type="number"
                        value={retentionDays}
                        onChange={(e) => setRetentionDays(e.target.value)}
                        min="7"
                        max="365"
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of days to keep backup files before deletion
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backupLocation">Backup Location</Label>
                      <Input
                        id="backupLocation"
                        value={backupLocation}
                        onChange={(e) => setBackupLocation(e.target.value)}
                        placeholder="/path/to/backup"
                      />
                      <p className="text-xs text-muted-foreground">
                        Directory path where backup files will be stored
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => toast.info('Backup initiated')}>
                  Backup Now
                </Button>
                <Button onClick={() => handleSaveSettings('Backup')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Configuration */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconMail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for outgoing emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your email service provider&apos;s SMTP server
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                    />
                    <p className="text-xs text-muted-foreground">
                      Usually 587 (TLS) or 465 (SSL)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpEmail">SMTP Email Address</Label>
                    <Input
                      id="smtpEmail"
                      type="email"
                      value={smtpEmail}
                      onChange={(e) => setSmtpEmail(e.target.value)}
                      placeholder="noreply@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    placeholder="Enter SMTP password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your email account password or app password
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => toast.info('Test email sent')}>
                  Send Test Email
                </Button>
                <Button onClick={() => handleSaveSettings('Email')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure when to send email notifications to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Master switch for all email notifications
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                {emailNotifications && (
                  <>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifyElectionStart">Election Start Notification</Label>
                        <p className="text-xs text-muted-foreground">
                          Notify eligible voters when an election starts
                        </p>
                      </div>
                      <Switch
                        id="notifyElectionStart"
                        checked={notifyElectionStart}
                        onCheckedChange={setNotifyElectionStart}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifyElectionEnd">Election End Notification</Label>
                        <p className="text-xs text-muted-foreground">
                          Notify voters when an election is about to end
                        </p>
                      </div>
                      <Switch
                        id="notifyElectionEnd"
                        checked={notifyElectionEnd}
                        onCheckedChange={setNotifyElectionEnd}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifyNewCandidate">New Candidate Notification</Label>
                        <p className="text-xs text-muted-foreground">
                          Notify admins when a new candidate applies
                        </p>
                      </div>
                      <Switch
                        id="notifyNewCandidate"
                        checked={notifyNewCandidate}
                        onCheckedChange={setNotifyNewCandidate}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifyResults">Results Announcement Notification</Label>
                        <p className="text-xs text-muted-foreground">
                          Notify users when election results are published
                        </p>
                      </div>
                      <Switch
                        id="notifyResults"
                        checked={notifyResults}
                        onCheckedChange={setNotifyResults}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('Notification')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Settings */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUsers className="h-5 w-5" />
                User Management Settings
              </CardTitle>
              <CardDescription>
                Configure default user registration and approval settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultUserRole">Default User Role</Label>
                  <select
                    id="defaultUserRole"
                    value={defaultUserRole}
                    onChange={(e) => setDefaultUserRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="USER">USER - Regular User</option>
                    <option value="POLL_WATCHER">POLL_WATCHER - Poll Observer</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Default role assigned to new users upon registration
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                    <p className="text-xs text-muted-foreground">
                      Users must verify email before accessing the system
                    </p>
                  </div>
                  <Switch
                    id="requireEmailVerification"
                    checked={requireEmailVerification}
                    onCheckedChange={setRequireEmailVerification}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoApproveStudents">Auto-Approve Students</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically approve student accounts upon registration
                    </p>
                  </div>
                  <Switch
                    id="autoApproveStudents"
                    checked={autoApproveStudents}
                    onCheckedChange={setAutoApproveStudents}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoApproveFaculty">Auto-Approve Faculty</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically approve faculty accounts upon registration
                    </p>
                  </div>
                  <Switch
                    id="autoApproveFaculty"
                    checked={autoApproveFaculty}
                    onCheckedChange={setAutoApproveFaculty}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('User Management')} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconKey className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">System Version</p>
              <p className="font-medium">v1.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Database</p>
              <p className="font-medium">PostgreSQL</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
