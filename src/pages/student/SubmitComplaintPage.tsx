import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartments, createComplaint, uploadComplaintImage } from '@/services/api';
import { COMPLAINT_CATEGORIES } from '@/types/types';
import type { Department } from '@/types/types';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title too long'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  department_id: z.string().min(1, 'Please select a department'),
  is_anonymous: z.boolean(),
});
type FormData = z.infer<typeof schema>;

const SubmitComplaintPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_anonymous: false },
  });

  const isAnonymous = watch('is_anonymous');

  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', { description: 'Max file size is 10MB. Large files will be compressed.' });
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    maxFiles: 1,
  });

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: FormData) => {
    if (!profile?.id) return;

    let imageUrl: string | undefined;

    if (imageFile) {
      setIsUploading(true);
      // Simulate progress
      const timer = setInterval(() => setUploadProgress(p => Math.min(p + 20, 80)), 200);
      imageUrl = (await uploadComplaintImage(imageFile, profile.id)) ?? undefined;
      clearInterval(timer);
      setUploadProgress(100);
      setIsUploading(false);

      if (!imageUrl) {
        toast.error('Image upload failed', { description: 'Please try again or submit without an image.' });
        setUploadProgress(0);
        return;
      }
      toast.success('Image uploaded', { description: 'Image compressed and uploaded successfully.' });
    }

    const complaintId = await createComplaint({
      ...data,
      image_url: imageUrl,
      created_by: profile.id,
    });

    if (!complaintId) {
      toast.error('Submission failed', { description: 'Please try again.' });
      return;
    }

    toast.success('Complaint submitted!', { description: 'Your complaint has been submitted successfully.' });
    navigate('/dashboard/complaints');
  };

  const charCount = watch('description')?.length ?? 0;

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Submit a Complaint</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Fill in the details below to submit your complaint.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Category & Department row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Department <span className="text-destructive">*</span></Label>
              <Select onValueChange={(v) => setValue('department_id', v)}>
                <SelectTrigger className={errors.department_id ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department_id && <p className="text-xs text-destructive">{errors.department_id.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <span className={cn('text-xs', charCount > 1800 ? 'text-destructive' : 'text-muted-foreground')}>{charCount}/2000</span>
            </div>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail. Include when it happened, who was involved, and any other relevant information."
              rows={5}
              {...register('description')}
              className={errors.description ? 'border-destructive resize-none' : 'resize-none'}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* Image upload */}
          <div className="space-y-1.5">
            <Label>Attachment <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>

            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center cursor-pointer transition-colors',
                  isDragActive ? 'border-primary bg-primary/5' : 'hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <input {...getInputProps()} />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {isDragActive ? <Upload className="h-5 w-5 text-primary" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Supports JPEG, PNG, GIF, WEBP. Large files will be auto-compressed.
                  </p>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">Submit Anonymously</Label>
              <p className="text-xs text-muted-foreground">
                Your name will be hidden from authorities. Admins can still view your identity.
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(v) => setValue('is_anonymous', v)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Submit Complaint</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default SubmitComplaintPage;
