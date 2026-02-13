import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Controlla la tua email per confermare la registrazione');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Accesso effettuato');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#004a99]">
          Cilento Kibs
        </h1>
        <h2 className="text-lg mb-4 text-center">
          {isSignUp ? 'Registrazione' : 'Accedi'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004a99] text-white p-2 rounded hover:bg-[#003d80] disabled:opacity-50"
          >
            {loading ? 'Caricamento...' : isSignUp ? 'Registrati' : 'Accedi'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? 'Hai già un account?' : 'Non hai un account?'}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#004a99] underline"
          >
            {isSignUp ? 'Accedi' : 'Registrati'}
          </button>
        </p>
      </div>
    </div>
  );
}
