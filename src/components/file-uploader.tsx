'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, FileText, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/lib/types';

interface FileUploaderProps {
  onTransactionsLoaded: (transactions: Transaction[]) => void;
}

export default function FileUploader({ onTransactionsLoaded }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const acceptedMimeTypes = {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF, or Excel file.',
        variant: 'destructive',
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: acceptedMimeTypes,
  });
  
  const handleProcessFile = async () => {
    if (!file) return;

    setIsLoading(true);
    
    if (file.type === 'application/pdf' || file.type.includes('excel') || file.type.includes('spreadsheetml')) {
       toast({
        title: 'File type not yet supported',
        description: 'PDF and Excel processing is coming soon.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Upload Statement</CardTitle>
        <CardDescription>Upload your bank statement in PDF or Excel format.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                {file.type.includes('excel') || file.type.includes('spreadsheetml') ? <FileSpreadsheet className="h-6 w-6 text-primary" /> : <FileText className="h-6 w-6 text-primary" />}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleProcessFile} className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Process File
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <FileUp className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">
                {isDragActive ? 'Drop the files here...' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-sm text-muted-foreground">PDF or Excel files supported</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
