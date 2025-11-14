/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Upload, Database, Loader2, History, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type BackupHistoryItem = {
  id: string;
  action: string;
  filename: string;
  status: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  } | null;
};

export default function BackupDatabaseClient() {
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [isRestoreLoading, setIsRestoreLoading] = useState(false);
  const [history, setHistory] = useState<BackupHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch backup history
  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await fetch('/api/backup/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleBackup = async () => {
    try {
      setIsBackupLoading(true);
      toast.loading('Creating database backup...', { id: 'backup' });

      const response = await fetch('/api/backup', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create backup');
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'backup.sql';

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Database backup created successfully!', { id: 'backup' });
      fetchHistory(); // Refresh history
    } catch (error: any) {
      console.error('Backup error:', error);
      toast.error(error.message || 'Failed to create backup', { id: 'backup' });
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.sql')) {
        toast.error('Please select a valid .sql file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to restore');
      return;
    }

    try {
      setIsRestoreLoading(true);
      toast.loading('Restoring database...', { id: 'restore' });

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to restore database');
      }

      toast.success('Database restored successfully!', { id: 'restore' });
      setIsRestoreDialogOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchHistory(); // Refresh history
    } catch (error: any) {
      console.error('Restore error:', error);
      toast.error(error.message || 'Failed to restore database', { id: 'restore' });
    } finally {
      setIsRestoreLoading(false);
    }
  };

  const handleDialogClose = () => {
    if (!isRestoreLoading) {
      setIsRestoreDialogOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Backup & Restore Database</h1>
        <p className="text-muted-foreground mt-2">
          Manage your database backups and restore from previous backups
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Backup Card */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Backup Database</h3>
              <p className="text-sm text-muted-foreground">
                Create a full backup of your database
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Exports all data including tables, schemas, and records</p>
            <p>• Downloads as a .sql file</p>
            <p>• Safe to run anytime</p>
          </div>

          <Button
            onClick={handleBackup}
            disabled={isBackupLoading}
            className="w-full"
            size="lg"
          >
            {isBackupLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Backup...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Create Backup
              </>
            )}
          </Button>
        </div>

        {/* Restore Card */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Upload className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Restore Database</h3>
              <p className="text-sm text-muted-foreground">
                Restore from a previous backup file
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Restores data from a .sql backup file</p>
            <p>• Overwrites current database data</p>
            <p className="text-destructive font-medium">⚠️ Use with caution!</p>
          </div>

          <Button
            onClick={() => setIsRestoreDialogOpen(true)}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            <Upload className="mr-2 h-4 w-4" />
            Restore Database
          </Button>
        </div>
      </div>

      {/* Restore Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Restore Database
            </DialogTitle>
            <DialogDescription>
              Select a .sql backup file to restore your database. This will overwrite all
              current data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="file-upload"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Backup File
              </label>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".sql"
                onChange={handleFileSelect}
                disabled={isRestoreLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive font-medium">⚠️ Warning</p>
              <p className="text-xs text-muted-foreground mt-1">
                This action will replace all current database data with the backup file
                contents. Make sure you have a recent backup before proceeding.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              disabled={isRestoreLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRestore}
              disabled={!selectedFile || isRestoreLoading}
            >
              {isRestoreLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Restore
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup History Table */}
      <div className="border rounded-lg">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">Backup & Restore History</h3>
                <p className="text-sm text-muted-foreground">Recent backup and restore operations</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistory}
              disabled={isHistoryLoading}
            >
              {isHistoryLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isHistoryLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No backup history yet</p>
              <p className="text-sm">Create your first backup to see it here</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Triggered By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.action === 'DB_BACKUP' ? (
                          <Download className="h-4 w-4 text-primary" />
                        ) : (
                          <Upload className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm font-medium">
                          {item.action === 'DB_BACKUP' ? 'Backup' : 'Restore'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground font-mono">
                        {item.filename}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : item.status === 'FAILED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">{item.user?.name || 'Unknown'}</div>
                        <div className="text-muted-foreground text-xs">{item.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                      <br />
                      <span className="text-xs">{format(new Date(item.createdAt), 'hh:mm a')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
