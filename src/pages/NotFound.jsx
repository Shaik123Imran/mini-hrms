// pages/NotFound.jsx
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-slate-200 leading-none select-none">404</div>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">Page Not Found</h1>
        <p className="text-slate-500 text-sm mt-2 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            <Home size={16} /> Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
