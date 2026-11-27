import { useState, FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLogin } from '@/features/auth/api/auth';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getErrorMessage, getErrorStatus } from '@/shared/api/errors';

// Wrong credentials come back as 401 or 403 depending on the Spring config.
const loginErrorMessage = (error: unknown) => {
  const status = getErrorStatus(error);
  return status === 401 || status === 403 ? 'Invalid username or password.' : getErrorMessage(error);
};

export const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { mutate: login, isPending, error } = useLogin();
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(credentials, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen container-app flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-2xl text-center">
          <h1 className="text-3xl font-bold text-primary mb-sm">RetailLite</h1>
          <p className="text-muted-foreground">Enterprise Retail Management</p>
        </div>

        {/* Card */}
        <div className="card-elevated p-2xl">
          <h2 className="text-xl font-semibold mb-lg">Sign In</h2>

          {/* Error Message */}
          <ErrorAlert error={error ? loginErrorMessage(error) : null} className="mb-lg" />

          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-xs">Username</label>
              <input
                id='username'
                name='username'
                autoComplete="username"
                type="text"
                className="input-field"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                disabled={isPending}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-xs">Password</label>
              <input
                id='password'
                name='password'
                type="password"
                autoComplete="current-password"
                className="input-field"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                disabled={isPending}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || !credentials.username || !credentials.password}
              className="button-primary w-full"
            >
              {isPending ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* New Registration */}
          <div className="mt-lg p-md bg-primary/5 border border-primary/10 rounded-md text-xs text-muted-foreground">
            {/* <p className="font-medium mb-xs">Demo Credentials:</p> */}
            <p>Contact Admin for User Registration</p>
            {/* <p>User: user / password123</p> */}
          </div>
        </div>
      </div>
    </div>
  );
};
