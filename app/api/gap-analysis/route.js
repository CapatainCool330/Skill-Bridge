import { NextResponse } from 'next/server';
import { performGapAnalysis, getTargetRoles } from '@/lib/gapAnalysis';

export async function POST(request) {
  try {
    const body = await request.json();
    const { skills, skillNames, targetRole, forceRuleBased } = body;

    if (!skills || !Array.isArray(skills) || !targetRole) {
      return NextResponse.json(
        { error: 'Provide {skills: string[], skillNames: string[], targetRole: string}' },
        { status: 400 }
      );
    }

    const result = await performGapAnalysis(skills, targetRole, skillNames || skills, forceRuleBased);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const roles = getTargetRoles();
  return NextResponse.json(roles);
}
