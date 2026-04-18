'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  year: string;
}

interface ReviewResult {
  revieweeName: string;
  revieweeYear: string;
  category: string;
}

export default function ReviewDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<ReviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students);
        } else {
          router.push('/');
        }
      } catch (err) {
        setMessage('Failed to load students.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [router]);

  const handleReview = (category: string) => {
    const student = students[currentIndex];
    
    if (category !== 'Skip') {
      setReviews([...reviews, {
        revieweeName: student.name,
        revieweeYear: student.year,
        category,
      }]);
    }
    
    setCurrentIndex(currentIndex + 1);
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews }),
      });

      if (res.ok) {
        setMessage('success');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to submit reviews');
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Loading students...</div>;
  }

  if (students.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h2 className="heading">No Students Available</h2>
          <p>The admin has not added any students to review yet.</p>
        </div>
      </div>
    );
  }

  if (message === 'success') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Thank You!</h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>Your reviews have been submitted successfully.</p>
          <button className="btn-secondary" style={{ marginTop: '2rem' }} onClick={() => router.push('/')}>Return to Login</button>
        </div>
      </div>
    );
  }

  const isCompleted = currentIndex >= students.length;

  if (isCompleted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center', width: '100%', maxWidth: '500px' }}>
          <h2 className="heading">Review Complete</h2>
          <p style={{ marginBottom: '2rem', color: '#cbd5e1' }}>
            You have reviewed {reviews.length} out of {students.length} students.
          </p>
          {message && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{message}</div>}
          <button className="btn-primary" onClick={handleSubmitAll} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit All Reviews'}
          </button>
        </div>
      </div>
    );
  }

  const currentStudent = students[currentIndex];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 500, color: '#94a3b8' }}>
        Student {currentIndex + 1} of {students.length}
      </div>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '0.5rem', color: 'var(--accent-color)', fontWeight: 600, letterSpacing: '1px' }}>
          {currentStudent.year} YEAR
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '3rem', wordBreak: 'break-word' }}>
          {currentStudent.name}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            className="btn-primary" 
            style={{ padding: '1rem', fontSize: '1.1rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#34d399' }}
            onClick={() => handleReview('Excellent')}
          >
            Excellent
          </button>
          <button 
            className="btn-primary" 
            style={{ padding: '1rem', fontSize: '1.1rem', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.5)', color: '#60a5fa' }}
            onClick={() => handleReview('Good')}
          >
            Good
          </button>
          <button 
            className="btn-primary" 
            style={{ padding: '1rem', fontSize: '1.1rem', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.5)', color: '#fbbf24' }}
            onClick={() => handleReview('Namesake')}
          >
            Namesake
          </button>
          <div style={{ marginTop: '1rem' }}>
            <button 
              className="btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => handleReview('Skip')}
            >
              Skip (Don't Know)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
