import { NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/lib/interviewGenerator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { skills, targetRole, count } = body;

    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'Provide {skills: string[], targetRole: string, count?: number}' },
        { status: 400 }
      );
    }

    const result = await generateInterviewQuestions(skills, targetRole, count || 8);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
