import { useState } from 'react';

const CLINICAL_ROLES = [
  'Registered Nurse (RN)',
  'Nurse Practitioner (NP)',
  'Licensed Practical Nurse (LPN)',
  'Pharmacist (PharmD)',
  'Pharmacy Technician',
  'Physician (MD/DO)',
  'Physician Assistant (PA)',
  'Physical Therapist',
  'Occupational Therapist',
  'Respiratory Therapist',
  'Medical Laboratory Scientist',
  'Radiologic Technologist',
  'Dietitian/Nutritionist',
  'Speech-Language Pathologist',
  'Other Clinical Role',
] as const;

const TECH_ROLES = [
  { value: 'clinical-data-analyst', label: 'Clinical Data Analyst' },
  { value: 'health-informatics-analyst', label: 'Health Informatics Analyst' },
  { value: 'ehr-implementation-specialist', label: 'EHR Implementation Specialist' },
  { value: 'health-tech-product-manager', label: 'Health Tech Product Manager' },
  { value: 'healthcare-ai-ml-engineer', label: 'Healthcare AI/ML Engineer' },
  { value: 'health-tech-regulatory-compliance-analyst', label: 'Health Tech Regulatory Compliance Analyst' },
  { value: 'health-data-analyst', label: 'Health Data Analyst' },
  { value: 'healthcare-cybersecurity-analyst', label: 'Healthcare Cybersecurity Analyst' },
  { value: 'clinical-research-associate', label: 'Clinical Research Associate' },
  { value: 'healthcare-it-project-manager', label: 'Healthcare IT Project Manager' },
  { value: 'healthcare-data-engineer', label: 'Healthcare Data Engineer' },
  { value: 'heor-rwe-analyst', label: 'HEOR/Real-World Evidence Analyst' },
  { value: 'medical-writer', label: 'Medical Writer' },
  { value: 'other', label: 'Other Health Tech Role' },
] as const;

const TIMELINE_OPTIONS = [
  'Less than 3 months',
  '3 to 6 months',
  '6 to 12 months',
  '1 to 2 years',
  'More than 2 years',
  'Still in transition',
] as const;

interface FormData {
  name: string;
  email: string;
  previousRole: string;
  previousRoleOther: string;
  currentTitle: string;
  techRoleSlug: string;
  techRoleOther: string;
  company: string;
  transitionTimeline: string;
  skillsTransferred: string;
  whatYouLearned: string;
  resourcesThatHelped: string;
  whatSurprisedYou: string;
  adviceForOthers: string;
  linkedinUrl: string;
  publicSourceUrl: string;
  consentToFeature: boolean;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  previousRole: '',
  previousRoleOther: '',
  currentTitle: '',
  techRoleSlug: '',
  techRoleOther: '',
  company: '',
  transitionTimeline: '',
  skillsTransferred: '',
  whatYouLearned: '',
  resourcesThatHelped: '',
  whatSurprisedYou: '',
  adviceForOthers: '',
  linkedinUrl: '',
  publicSourceUrl: '',
  consentToFeature: false,
};

export default function ContributeForm() {
  const [form, setForm] = useState<FormData>(initialFormData);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.previousRole || !form.techRoleSlug || !form.transitionTimeline) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!form.consentToFeature) {
      setStatus('error');
      setErrorMessage('Please confirm that you consent to having your story featured.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('success');
        setForm(initialFormData);
      } else {
        const data = await res.json();
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">&#10003;</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank you for sharing your story</h2>
        <p className="text-gray-600 mb-6">
          We will review your submission and reach out if we need any additional details.
          Verified stories get featured on the roadmap page with full credit to you.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Roadmaps
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-10">

      {/* Section 1: About You */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-gray-900 mb-1">About You</legend>
        <p className="text-sm text-gray-500 mb-4">Basic information so we can verify and credit your story.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Jane Doe"
              required
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="jane@example.com"
              required
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="linkedin"
              type="url"
              value={form.linkedinUrl}
              onChange={e => update('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/in/janedoe"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
              Public Source Link <span className="text-gray-400">(blog, article, post, linkedin)</span>
            </label>
            <input
              id="source"
              type="url"
              value={form.publicSourceUrl}
              onChange={e => update('publicSourceUrl', e.target.value)}
              placeholder="https://medium.com/@jane/my-transition"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </fieldset>

      {/* Section 2: Your Transition */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-gray-900 mb-1">Your Transition</legend>
        <p className="text-sm text-gray-500 mb-4">Tell us about where you came from and where you landed.</p>

        <div>
          <label htmlFor="previousRole" className="block text-sm font-medium text-gray-700 mb-1">
            Previous Clinical Role <span className="text-red-500">*</span>
          </label>
          <select
            id="previousRole"
            value={form.previousRole}
            onChange={e => update('previousRole', e.target.value)}
            required
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
          >
            <option value="">Select your clinical background</option>
            {CLINICAL_ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {form.previousRole === 'Other Clinical Role' && (
          <div>
            <label htmlFor="previousRoleOther" className="block text-sm font-medium text-gray-700 mb-1">
              Specify Your Clinical Role
            </label>
            <input
              id="previousRoleOther"
              type="text"
              value={form.previousRoleOther}
              onChange={e => update('previousRoleOther', e.target.value)}
              placeholder="e.g., Biomedical Engineer"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label htmlFor="techRole" className="block text-sm font-medium text-gray-700 mb-1">
            Which Role Did You Transition Into? <span className="text-red-500">*</span>
          </label>
          <select
            id="techRole"
            value={form.techRoleSlug}
            onChange={e => update('techRoleSlug', e.target.value)}
            required
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
          >
            <option value="">Select the role you transitioned into</option>
            {TECH_ROLES.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>

        {form.techRoleSlug === 'other' && (
          <div>
            <label htmlFor="techRoleOther" className="block text-sm font-medium text-gray-700 mb-1">
              Specify Your Tech Role
            </label>
            <input
              id="techRoleOther"
              type="text"
              value={form.techRoleOther}
              onChange={e => update('techRoleOther', e.target.value)}
              placeholder="e.g., Digital Health Consultant"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="currentTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Current Job Title
            </label>
            <input
              id="currentTitle"
              type="text"
              value={form.currentTitle}
              onChange={e => update('currentTitle', e.target.value)}
              placeholder="e.g., Clinical Data Analyst"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="company"
              type="text"
              value={form.company}
              onChange={e => update('company', e.target.value)}
              placeholder="e.g., Flatiron Health"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
            How Long Did the Transition Take? <span className="text-red-500">*</span>
          </label>
          <select
            id="timeline"
            value={form.transitionTimeline}
            onChange={e => update('transitionTimeline', e.target.value)}
            required
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
          >
            <option value="">Select a timeline</option>
            {TIMELINE_OPTIONS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Section 3: Your Experience */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-gray-900 mb-1">Your Experience</legend>
        <p className="text-sm text-gray-500 mb-4">
          This is the part that helps others. Be as specific as you can.
        </p>

        <div>
          <label htmlFor="skillsTransferred" className="block text-sm font-medium text-gray-700 mb-1">
            What Clinical Skills Transferred Directly?
          </label>
          <textarea
            id="skillsTransferred"
            value={form.skillsTransferred}
            onChange={e => update('skillsTransferred', e.target.value)}
            placeholder="e.g., My experience with medication error reporting translated directly into data quality assurance work. I already knew how to spot anomalies in clinical data..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
          />
        </div>

        <div>
          <label htmlFor="whatYouLearned" className="block text-sm font-medium text-gray-700 mb-1">
            What Did You Have to Learn?
          </label>
          <textarea
            id="whatYouLearned"
            value={form.whatYouLearned}
            onChange={e => update('whatYouLearned', e.target.value)}
            placeholder="e.g., SQL was the biggest learning curve. I spent 6 weeks doing daily practice on Codecademy before I felt comfortable querying real datasets..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
          />
        </div>

        <div>
          <label htmlFor="resourcesThatHelped" className="block text-sm font-medium text-gray-700 mb-1">
            What Resources Helped Most?
          </label>
          <textarea
            id="resourcesThatHelped"
            value={form.resourcesThatHelped}
            onChange={e => update('resourcesThatHelped', e.target.value)}
            placeholder="e.g., Google Data Analytics Certificate on Coursera, the MIMIC-III dataset for hands-on practice, and a mentor I found through LinkedIn who was a former nurse turned data analyst..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
          />
        </div>

        <div>
          <label htmlFor="whatSurprisedYou" className="block text-sm font-medium text-gray-700 mb-1">
            What Surprised You About the Transition?
          </label>
          <textarea
            id="whatSurprisedYou"
            value={form.whatSurprisedYou}
            onChange={e => update('whatSurprisedYou', e.target.value)}
            placeholder="e.g., I didn't expect how much hiring managers valued my clinical background. In interviews, my ability to explain what a lab value actually means gave me a clear edge over candidates with pure tech backgrounds..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
          />
        </div>

        <div>
          <label htmlFor="adviceForOthers" className="block text-sm font-medium text-gray-700 mb-1">
            What Advice Would You Give Someone Starting This Transition?
          </label>
          <textarea
            id="adviceForOthers"
            value={form.adviceForOthers}
            onChange={e => update('adviceForOthers', e.target.value)}
            placeholder="e.g., Don't wait until you feel 'ready.' Start applying after your first portfolio project. Most job descriptions list ideal qualifications, not minimum requirements..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
          />
        </div>
      </fieldset>

      {/* Consent */}
      <div className="p-5 rounded-xl bg-green-50 border border-green-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consentToFeature}
            onChange={e => update('consentToFeature', e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            I consent to having my story featured on Health Tech Roadmaps. I understand that my name, previous role, current title, and company may be displayed publicly. My email will never be shared. <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      {/* Error message */}
      {status === 'error' && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base"
      >
        {status === 'loading' ? 'Submitting...' : 'Share My Transition Story'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        All submissions are reviewed before publishing. We verify transition details against public sources to maintain accuracy.
      </p>
    </form>
  );
}
