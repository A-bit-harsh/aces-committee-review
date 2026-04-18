import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const isAdmin = cookies().get('admin_auth')?.value === 'true';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { seStudents, teStudents } = await request.json();

    // Validate
    if (!Array.isArray(seStudents) || !Array.isArray(teStudents)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Clear existing students
    await prisma.student.deleteMany();

    // Insert new students
    const studentsToInsert = [
      ...seStudents.map((name: string) => ({ name, year: 'SE' })),
      ...teStudents.map((name: string) => ({ name, year: 'TE' })),
    ];

    if (studentsToInsert.length > 0) {
      await prisma.student.createMany({
        data: studentsToInsert,
      });
    }

    return NextResponse.json({ success: true, message: 'Students updated successfully' });
  } catch (error) {
    console.error('Error updating students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
