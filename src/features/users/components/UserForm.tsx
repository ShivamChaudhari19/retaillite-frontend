import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { UserRequest } from '@/shared/types';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(20, 'Name must be at most 20 characters'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(16, 'Password must be at most 16 characters'),
  role: z.enum(['ROLE_ADMIN', 'ROLE_USER'], { message: 'Please select a role' }),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  onSubmit: (data: UserRequest) => void;
  isLoading?: boolean;
  error?: Error | null;
  onCancel?: () => void;
}

export const UserForm = ({ onSubmit, isLoading = false, error, onCancel }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit({
      name: data.name,
      username: data.username,
      password: data.password,
      role: data.role,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-lg max-w-md">
      {/* Error Message */}
      <ErrorAlert error={error} />

      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Full Name</label>
        <input
          type="text"
          placeholder="John Doe"
          className={`input-field ${errors.name ? 'border-destructive' : ''}`}
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && <p className="text-xs text-destructive mt-xs">{errors.name.message}</p>}
      </div>

      {/* Username Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Username</label>
        <input
          type="text"
          placeholder="johndoe"
          className={`input-field ${errors.username ? 'border-destructive' : ''}`}
          {...register('username')}
          disabled={isLoading}
        />
        {errors.username && <p className="text-xs text-destructive mt-xs">{errors.username.message}</p>}
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          className={`input-field ${errors.password ? 'border-destructive' : ''}`}
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && <p className="text-xs text-destructive mt-xs">{errors.password.message}</p>}
      </div>

      {/* Role Field */}
      <div>
        <label className="block text-sm font-medium mb-xs">Role</label>
        <select
          className={`input-field ${errors.role ? 'border-destructive' : ''}`}
          {...register('role')}
          disabled={isLoading}
        >
          <option value="">Select a role</option>
          <option value="ROLE_USER">User</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>
        {errors.role && <p className="text-xs text-destructive mt-xs">{errors.role.message}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-md pt-lg">
        <button
          type="submit"
          disabled={isLoading}
          className="button-primary flex-1"
        >
          {isLoading ? 'Creating...' : 'Create User'}
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
