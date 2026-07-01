import { cn } from "@/lib/utils";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { UploadCloud, X, FileIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";

interface DropzoneProps {
  onChange?: (files: File[]) => void;
  value?: File[];
  className?: string;
}

export default function Dropzone({ onChange, value = [], className }: DropzoneProps) {
  const [files, setFiles] = React.useState<File[]>(value);
  const { uploadFile, isUploading } = useSupabaseUpload();

  React.useEffect(() => {
    if (onChange) {
      onChange(files);
    }
  }, [files, onChange]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-muted/50"
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Drag & drop files here, or click to select
        </p>
        <p className="text-xs text-muted-foreground/70">
          Support for multiple files
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file: File, idx: number) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between p-3 bg-muted rounded-md border text-sm"
            >
              <div className="flex items-center gap-2 max-w-[80%]">
                <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => removeFile(idx, e)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}