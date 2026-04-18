'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  revieweeName: string;
  revieweeYear: string;
  category: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [seStudents, setSeStudents] = useState('');
  const [teStudents, setTeStudents] = useState('');
  const [updatingStudents, setUpdatingStudents] = useState(false);
  const [studentMessage, setStudentMessage] = useState({ type: '', text: '' });
  
  const router = useRouter();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/admin/reviews');
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews);
        } else {
          router.push('/');
        }
      } catch (err) {
        setError('Failed to fetch reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [router]);

  const handleExport = () => {
    window.location.href = '/api/admin/export';
  };

  const handleUpdateStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStudents(true);
    setStudentMessage({ type: '', text: '' });
    
    const seList = seStudents.split('\n').map(s => s.trim()).filter(s => s);
    const teList = teStudents.split('\n').map(s => s.trim()).filter(s => s);
    
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seStudents: seList, teStudents: teList }),
      });
      
      if (res.ok) {
        setStudentMessage({ type: 'success', text: `Successfully loaded ${seList.length + teList.length} students.` });
      } else {
        setStudentMessage({ type: 'error', text: 'Failed to update students.' });
      }
    } catch (err) {
      setStudentMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setUpdatingStudents(false);
    }
  };

  const getBadgeClass = (category: string) => {
    switch (category) {
      case 'Excellent': return 'badge badge-excellent';
      case 'Good': return 'badge badge-good';
      case 'Namesake': return 'badge badge-namesake';
      default: return 'badge';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Loading reviews...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%' }}>
        <h2 className="heading" style={{ fontSize: '1.5rem', textAlign: 'left', marginBottom: '1rem' }}>Manage Students</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>Paste student names here (one name per line). Warning: Updating will replace the current list of students to be reviewed.</p>
        
        <form onSubmit={handleUpdateStudents}>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">SE Students</label>
              <textarea 
                className="input-field" 
                rows={6} 
                placeholder="John Doe\nJane Smith"
                value={seStudents}
                onChange={(e) => setSeStudents(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">TE Students</label>
              <textarea 
                className="input-field" 
                rows={6} 
                placeholder="Alice Johnson\nBob Williams"
                value={teStudents}
                onChange={(e) => setTeStudents(e.target.value)}
              />
            </div>
          </div>
          
          {studentMessage.text && (
            <div className={studentMessage.type === 'error' ? 'error-message' : 'success-message'} style={{ textAlign: 'left', marginBottom: '1rem' }}>
              {studentMessage.text}
            </div>
          )}
          
          <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={updatingStudents}>
            {updatingStudents ? 'Updating...' : 'Update Student List'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ width: '100%', minHeight: '60vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="heading" style={{ margin: 0 }}>Review Results</h1>
          <button onClick={handleExport} className="btn-primary" style={{ width: 'auto' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export to Excel
          </button>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reviewer Name</th>
                <th>Reviewer Email</th>
                <th>Student Name</th>
                <th>Year</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No reviews found.</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id}>
                    <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                    <td>{review.reviewerName}</td>
                    <td>{review.reviewerEmail}</td>
                    <td>{review.revieweeName}</td>
                    <td>{review.revieweeYear}</td>
                    <td>
                      <span className={getBadgeClass(review.category)}>
                        {review.category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
