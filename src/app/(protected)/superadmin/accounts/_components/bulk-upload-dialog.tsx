"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { bulkCreateUsers } from "@/actions";
import { Progress } from "@/components/ui/progress";

export default function BulkUploadDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const resetState = () => {
    setFile(null);
    setProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    onDropRejected: () =>
      toast.error("Please upload a valid Excel file (.xlsx or .xls)"),
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const binary = bytes.reduce((acc, b) => acc + String.fromCharCode(b), "");
      const base64 = btoa(binary);

      // simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 200);

      const result = await bulkCreateUsers(base64, file.name);
      clearInterval(interval);
      setProgress(100);

      if (result.error) {
        toast.error(result.error);
        setIsUploading(false);
        return;
      }

      toast.success(
        result.success ||
          `Successfully created ${result.createdCount || 0} user(s)`
      );

      if (result.errors?.length) {
        console.error(result.errors);
        toast.warning(
          `${result.errors.length} user(s) could not be created. Check console for details.`
        );
      }

      resetState();
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isUploading) {
          setOpen(isOpen);
          if (!isOpen) resetState();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="size-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Create Accounts from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .xls) with user data including:
            email, userId, name, role, userType, status, year, course,
            section, institute, department, position, unit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Box */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} disabled={isUploading} />

            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="size-12 mx-auto text-primary" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  disabled={isUploading}
                >
                  <X className="size-4 mr-2" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="size-12 mx-auto text-muted-foreground" />
                <p className="font-medium">
                  {isDragActive ? "Drop the file here" : "Click or drag file here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports .xlsx and .xls formats
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Upload & Create Accounts"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
