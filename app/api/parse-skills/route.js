import { NextResponse } from 'next/server';
import { parseResumeText, parseSkillsList, getAllSkills } from '@/lib/skillsParser';

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, type, skills } = body;

    if (type === 'resume' && text) {
      const result = parseResumeText(text);
      return NextResponse.json(result);
    } else if (type === 'skills_list' && skills) {
      const result = parseSkillsList(skills);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Invalid request. Provide {text, type: "resume"} or {skills, type: "skills_list"}' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const allSkills = getAllSkills();
  return NextResponse.json(allSkills);
}
