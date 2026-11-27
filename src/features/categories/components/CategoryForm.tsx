import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { ImageUpload } from '@/shared/components/ImageUpload';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(25, 'Name must be at most 25 characters'),
  description: z.string().max(300, 'Description must be at most 300 characters').optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading?: boolean;
  error?: Error | null;
  onCancel?: () => void;
}

export const CategoryForm = ({ onSubmit, isLoading = false, error, onCancel }: CategoryFormProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const handleImageSelected = (file: File) => {
    setImage(file);
    setImageError(null);
  };

  const handleFormSubmit = (data: CategoryFormData) => {
    if (!image) {
      setImageError('Image is required');
      return;
    }

    const formData = new FormData();
    formData.append(
      'category', 
      new Blob([JSON.stringify({name: data.name,description: data.description || '',})],{type: 'application/json'}),'category.json'
      );
    formData.append('categoryImg', image);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-lg max-w-md">
      {/* Error Message */}
      <ErrorAlert error={error} />

      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Category Name</label>
        <input
          type="text"
          placeholder="Electronics"
          className={`input-field ${errors.name ? 'border-destructive' : ''}`}
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && <p className="text-xs text-destructive mt-xs">{errors.name.message}</p>}
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Description (Optional)</label>
        <textarea
          placeholder="Enter category description..."
          className={`input-field resize-none h-24 ${errors.description ? 'border-destructive' : ''}`}
          {...register('description')}
          disabled={isLoading}
        />
        {errors.description && <p className="text-xs text-destructive mt-xs">{errors.description.message}</p>}
      </div>

      {/* Image Upload */}
      <ImageUpload
        onImageSelected={handleImageSelected}
        label="Category Image"
        error={imageError || undefined}
      />

      {/* Buttons */}
      <div className="flex gap-md pt-lg">
        <button
          type="submit"
          disabled={isLoading}
          className="button-primary flex-1"
        >
          {isLoading ? 'Creating...' : 'Create Category'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="button-secondary flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
