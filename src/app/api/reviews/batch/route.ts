import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const reviewerEmail = cookies().get('reviewer_email')?.value;
    const reviewerName = cookies().get('reviewer_name')?.value;

    if (!reviewerEmail || !reviewerName) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviews } = await request.json();

    if (!Array.isArray(reviews)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const reviewsToInsert = reviews.map((review: any) => ({
      reviewerName,
      reviewerEmail,
      revieweeName: review.revieweeName,
      revieweeYear: review.revieweeYear,
      category: review.category,
    }));

    if (reviewsToInsert.length > 0) {
      await prisma.review.createMany({
        data: reviewsToInsert,
      });
    }

    return NextResponse.json({ success: true, message: 'Reviews submitted successfully' });
  } catch (error) {
    console.error('Error batch inserting reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
