import { useState } from 'react';

interface EmailCaptureProps {
  roadmapSlug: string;
  roleTitle: string;
  position: 'mid' | 'end';
}

export default function EmailCapture({ roadmapSlug, roleTitle, position }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          roadmapSlug,
          source: position,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Check your inbox! Your action kit is on its way.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="my-12 rounded-xl bg-green-50 border border-green-200 p-8 text-center">
        <div className="text-3xl mb-3">✅</div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">You are all set!</h3>
        <p className="text-green-700">{message}</p>
      </div>
    );
  }

  return (
    <div className="my-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-8">
      <div className="max-w-xl mx-auto text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Get the {roleTitle} Action Kit
        </h3>
        <p className="text-gray-600 mb-6">
          Portfolio templates, interview prep questions, resume bullet formulas, and a 90-day execution plan.
          Free, delivered to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder="your.email@example.com"
            required
            className="flex-1 max-w-sm px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            {status === 'loading' ? 'Sending...' : 'Send My Action Kit'}
          </button>
        </form>

        {status === 'error' && (
          <p className="mt-3 text-sm text-red-600">{message}</p>
        )}

        <p className="mt-4 text-xs text-gray-500">
          You will also receive The Transmutation, our weekly newsletter for healthcare professionals in transition. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
