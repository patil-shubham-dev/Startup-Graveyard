'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SubmissionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    website: '',
    industry: '',
    shutdownYear: '',
    analysis: '',
    sources: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Submission failed. Please try again.');
        return;
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px', lineHeight: 1 }}>✓</div>
        <h2 className="t-h1" style={{ marginBottom: '16px' }}>Submission Received</h2>
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            color: 'var(--ink-muted)',
            lineHeight: '1.7',
            marginBottom: '32px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Our forensic team will review the case. Redirecting you to the home page...
        </p>
      </div>
    );
  }

  return (
    <>
      {submitError && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            backgroundColor: 'rgba(180, 70, 60, 0.1)',
            border: '1px solid rgba(180, 70, 60, 0.3)',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px',
            color: '#b4463c',
            borderRadius: '2px',
          }}
        >
          ERROR: {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
              marginBottom: '6px',
            }}
          >
            COMPANY NAME *
          </label>
          <input
            type="text"
            name="company"
            required
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. Acme Inc."
            className="sg-input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
              marginBottom: '6px',
            }}
          >
            WEBSITE (if available)
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://"
            className="sg-input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
              marginBottom: '6px',
            }}
          >
            INDUSTRY
          </label>
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="e.g. Fintech, SaaS, Healthtech"
            className="sg-input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
              marginBottom: '6px',
            }}
          >
            SHUTDOWN YEAR
          </label>
          <input
            type="number"
            name="shutdownYear"
            value={formData.shutdownYear}
            onChange={handleChange}
            min="2000"
            max="2030"
            placeholder="e.g. 2024"
            className="sg-input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
              marginBottom: '6px',
            }}
          >
            WHY IT FAILED (your analysis) *
          </label>
          <textarea
            name="analysis"
            rows={5}
            required
            value={formData.analysis}
            onChange={handleChange}
            placeholder="Briefly describe what went wrong..."
            className="sg-input"
            style={{ width: '100%', resize: 'vertical', minHeight: '100px' }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
              marginBottom: '6px',
            }}
          >
            SOURCE URLS (links to news coverage, blog posts, etc.)
          </label>
          <textarea
            name="sources"
            rows={3}
            value={formData.sources}
            onChange={handleChange}
            placeholder="https://..."
            className="sg-input"
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-rust"
          style={{ alignSelf: 'flex-start' }}
        >
          {isSubmitting ? 'SUBMITTING...' : 'SUBMIT CASE →'}
        </button>
      </form>
    </>
  );
}
