import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { ImageUpload } from '@/shared/components/ImageUpload';
import { useAllCategories } from '@/features/categories/api/categories';
import { CategoryResponse } from '@/shared/types';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  price: z.number({ invalid_type_error: 'Price is required' }).min(1, 'Price must be greater than 0'),
  taxRate: z.number({ invalid_type_error: 'Tax rate is required' }).min(0, 'Tax rate must be 0 or greater'),
  description: z.string().max(250, 'Description must be at most 250 characters').min(2,'description must be at leat 2 characters'),
  categoryId: z.string().min(1, 'Category is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading?: boolean;
  error?: Error | null;
  onCancel?: () => void;
}

export const ProductForm = ({ onSubmit, isLoading = false, error, onCancel }: ProductFormProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const { data: categoriesData } = useAllCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      price: 0,
      taxRate: 0,
    },
  });

  const handleImageSelected = (file: File) => {
    setImage(file);
    setImageError(null);
  };

  const handleFormSubmit = (data: ProductFormData) => {
    if (!image) {
      setImageError('Product image is required');
      return;
    }

    const formData = new FormData();

    const productData= {
      name: data.name,
      price: data.price,
      taxRate: data.taxRate,
      description: data.description || '',
      categoryId: data.categoryId,
    }

    formData.append('product',
      new Blob(
        [JSON.stringify(productData)],
        {type: 'application/json'}
      ),
      'product.json'
    )
    // formData.append('product', JSON.stringify({
    //   name: data.name,
    //   price: data.price,
    //   taxRate: data.taxRate,
    //   description: data.description || '',
    //   categoryId: data.categoryId,
    // }));
    formData.append('productImg', image);
const productPart = formData.get('product');

console.log('Is Blob:', productPart instanceof Blob);
console.log(
  'Blob MIME type:',
  productPart instanceof Blob ? productPart.type : 'Not a Blob'
);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-lg max-w-md">
      {/* Error Message */}
      <ErrorAlert error={error} />

      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Product Name</label>
        <input
          type="text"
          placeholder="Laptop Pro 15"
          className={`input-field ${errors.name ? 'border-destructive' : ''}`}
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && <p className="text-xs text-destructive mt-xs">{errors.name.message}</p>}
      </div>

      {/* Category Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Category</label>
        <select
          className={`input-field ${errors.categoryId ? 'border-destructive' : ''}`}
          {...register('categoryId')}
          disabled={isLoading}
        >
          <option value="">Select a category</option>
          {categoriesData?.map((cat: CategoryResponse) => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-xs text-destructive mt-xs">{errors.categoryId.message}</p>}
      </div>

      {/* Price Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Price (₹)</label>
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          className={`input-field ${errors.price ? 'border-destructive' : ''}`}
          {...register('price', { valueAsNumber: true })}
          disabled={isLoading}
        />
        {errors.price && <p className="text-xs text-destructive mt-xs">{errors.price.message}</p>}
      </div>

      {/* Tax Rate Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Tax Rate (%)</label>
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          className={`input-field ${errors.taxRate ? 'border-destructive' : ''}`}
          {...register('taxRate', { valueAsNumber: true })}
          disabled={isLoading}
        />
        {errors.taxRate && <p className="text-xs text-destructive mt-xs">{errors.taxRate.message}</p>}
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Description</label>
        <textarea
          placeholder="Enter product description..."
          className={`input-field resize-none h-24 ${errors.description ? 'border-destructive' : ''}`}
          {...register('description')}
          disabled={isLoading}
        />
        {errors.description && <p className="text-xs text-destructive mt-xs">{errors.description.message}</p>}
      </div>

      {/* Image Upload */}
      <ImageUpload
        onImageSelected={handleImageSelected}
        label="Product Image"
        error={imageError || undefined}
      />

      {/* Buttons */}
      <div className="flex gap-md pt-lg">
        <button
          type="submit"
          disabled={isLoading}
          className="button-primary flex-1"
        >
          {isLoading ? 'Creating...' : 'Create Product'}
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
