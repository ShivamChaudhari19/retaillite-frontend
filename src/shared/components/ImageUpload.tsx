import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  error?: string;
}

export const ImageUpload = ({
  onImageSelected,
  label = 'Upload Image',
  accept = 'image/*',
  maxSize = 5, // 5MB default
  error,
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    setFileName(file.name);
    onImageSelected(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-md">
      <label className="block text-sm font-medium">{label}</label>

      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-md border border-border"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 bg-destructive text-white p-xs rounded-full hover:bg-destructive/90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!preview && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-lg text-center cursor-pointer transition-colors ${
            error ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary hover:bg-primary/5'
          }`}
        >
          <Upload className={`w-8 h-8 mx-auto mb-md ${error ? 'text-destructive' : 'text-muted-foreground'}`} />
          <p className={`text-sm font-medium ${error ? 'text-destructive' : 'text-foreground'}`}>
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-xs">PNG, JPG, GIF up to {maxSize}MB</p>
        </div>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* File Name */}
      {fileName && (
        <p className="text-xs text-muted-foreground">
          Selected: <span className="font-medium">{fileName}</span>
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};
