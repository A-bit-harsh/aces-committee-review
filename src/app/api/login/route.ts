import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name, email, password, isAdmin } = await request.json();

    if (isAdmin) {
      if (password === 'admin123') {
        cookies().set('admin_auth', 'true', { httpOnly: true, path: '/' });
        return NextResponse.json({ success: true, redirect: '/admin' });
      } else {
        return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
      }
    } else {
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
      }
      if (!name || name.trim() === '') {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
      
      cookies().set('reviewer_email', email, { httpOnly: true, path: '/' });
      cookies().set('reviewer_name', name, { httpOnly: true, path: '/' });
      
      return NextResponse.json({ success: true, redirect: '/dashboard' });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
