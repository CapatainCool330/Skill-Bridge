import { NextResponse } from 'next/server';
import { generateRoadmap, aiEnhancedRoadmap } from '@/lib/roadmapGenerator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { missingSkills, preferences, userContext } = body;

    if (!missingSkills || !Array.isArray(missingSkills)) {
      return NextResponse.json(
        { error: 'Provide {missingSkills: array, preferences?: object}' },
        { status: 400 }
      );
    }

    let result;
    try {
      result = await aiEnhancedRoadmap(missingSkills, userContext);
    } catch {
      result = generateRoadmap(missingSkills, preferences);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
