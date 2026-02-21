import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Check for nested data structure from responseStandardizer
      const data = response.data.data || response.data;
      
      if (data.accessToken) {
        localStorage.setItem('admin_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('admin_refresh_token', data.refreshToken);
        }
        // Also store user info if available
        if (data.user) {
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        }
        navigate('/');
      } else {
        setError('Login failed: No token received');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Moozup Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4" role="alert">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <Input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              label="Email address"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              label="Password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
