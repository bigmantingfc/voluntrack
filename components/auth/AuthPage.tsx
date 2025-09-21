import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { MIN_PASSWORD_LENGTH, APP_NAME } from '../../constants';


const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const EmailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
const PhoneIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>);

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/opportunities";

  const validateForm = (): boolean => {
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return false;
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your name.');
      return false;
    }
    if (!isLogin && phone && phone.replace(/\D/g, '').length < 10) {
        setError('Please enter a valid phone number (at least 10 digits).');
        return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await auth.login(email, password);
        if (user) {
          navigate(from, { replace: true });
        } else {
          setError('Login failed. Please check your credentials.');
        }
      } else {
        const newUser = await auth.signup(name, email, password, phone);
        if (newUser) {
          navigate(from, { replace: true });
        } else {
          setError('An account with this email already exists.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl lg:max-w-5xl flex bg-white shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up">
        {/* Left Column (Form) */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
            <Link to="/" className="text-2xl font-bold text-primary mb-2 inline-block">{APP_NAME}</Link>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back!' : 'Create an Account'}
            </h2>
            <p className="text-gray-600 mb-6">{isLogin ? "Sign in to continue your journey." : "Join our community of changemakers."}</p>

            {error && <p className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded">{error}</p>}
            
            <form onSubmit={handleSubmit} className="mt-8">
            {!isLogin && (
                <Input label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required leftIcon={<UserIcon />} />
            )}
            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required leftIcon={<EmailIcon />} />
            {!isLogin && (
                <Input label="Phone Number (Optional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="For SMS notifications" leftIcon={<PhoneIcon />} />
            )}
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required leftIcon={<LockIcon />} />
            
            <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading || auth.isLoading} size="lg">
                {isLogin ? 'Login' : 'Create Account'}
            </Button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-primary hover:text-primary-dark">
                {isLogin ? 'Sign up' : 'Login'}
            </button>
            </p>
        </div>
        
        {/* Right Column (Image and Text) */}
        <div className="hidden md:block md:w-1/2 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/seed/volunteer/800/1000')"}}>
          <div className="h-full bg-primary bg-opacity-75 flex flex-col justify-center items-center text-white p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Make a Difference</h2>
            <p className="text-lg leading-relaxed">
                Your journey to make a difference starts here. Find opportunities, track your impact, and be part of a community that cares.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;