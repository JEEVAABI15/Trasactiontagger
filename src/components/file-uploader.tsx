'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, FileText, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/lib/types';
import * as XLSX from 'xlsx';

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
        description: 'Please upload a PDF or Excel file.',
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

    if (file.type.includes('excel') || file.type.includes('spreadsheetml')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Assuming header is in the first row
          const header = json[0] as string[];
          const rows = json.slice(1);
          
          const dateIndex = header.findIndex(h => h.toLowerCase() === 'date');
          const narrationIndex = header.findIndex(h => h.toLowerCase() === 'narration');
          const withdrawalIndex = header.findIndex(h => h.toLowerCase() === 'withdrawal');
          const depositIndex = header.findIndex(h => h.toLowerCase() === 'deposit');
          const closingBalanceIndex = header.findIndex(h => h.toLowerCase() === 'closing balance');

          if (dateIndex === -1 || narrationIndex === -1 || closingBalanceIndex === -1) {
             toast({
              title: 'Invalid Excel Format',
              description: "Could not find required columns: 'Date', 'Narration', 'Closing Balance'.",
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }

          const transactions: Transaction[] = rows.map((row: any, index) => {
            const withdrawal = parseFloat(row[withdrawalIndex]) || 0;
            const deposit = parseFloat(row[depositIndex]) || 0;
            const amount = withdrawal > 0 ? withdrawal : deposit;
            const type = withdrawal > 0 ? 'withdrawal' : 'deposit';

            // Handle Excel date serial number
            let date = row[dateIndex];
            if (typeof date === 'number') {
              date = new Date(Math.round((date - 25569) * 86400 * 1000)).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' });
            }


            return {
              id: `${Date.now()}-${index}`,
              date: date,
              narration: row[narrationIndex],
              amount: amount,
              type: type,
              closingBalance: parseFloat(row[closingBalanceIndex]),
              category: '',
              status: 'unprocessed',
            };
          }).filter(t => t.narration); // Filter out empty rows

          onTransactionsLoaded(transactions);
          setFile(null);

        } catch (error) {
          console.error("Error processing excel file:", error);
          toast({
            title: 'Error Processing File',
            description: 'There was an issue parsing your Excel file.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        toast({
          title: 'File Read Error',
          description: 'Could not read the selected file.',
          variant: 'destructive',
        });
        setIsLoading(false);
      };
      reader.readAsBinaryString(file);
    } else if (file.type === 'application/pdf') {
      toast({
        title: 'File type not yet supported',
        description: 'PDF processing is coming soon.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

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
                {file.type.includes('excel') || file.type.includes('spreadsheetml') ? (
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                ) : (
                  <FileText className="h-6 w-6 text-primary" />
                )}
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
