import courses from '@/data/courses.json';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate a learning roadmap from missing skills
 * Maps missing skills → courses, organized into phases
 */
export function generateRoadmap(missingSkills, preferences = {}) {
  const { prioritizeFree = false, maxDuration = null } = preferences;

  // Find courses for each missing skill
  const skillCourses = {};
  
  for (const skill of missingSkills) {
    const skillId = typeof skill === 'string' ? skill : skill.id;
    const matchingCourses = courses.filter(c => c.skills.includes(skillId));
    
    if (matchingCourses.length > 0) {
      // Sort: free first if preferred, then by difficulty, then by duration
      const sorted = matchingCourses.sort((a, b) => {
        if (prioritizeFree) {
          const aFree = a.cost.toLowerCase().includes('free') ? 0 : 1;
          const bFree = b.cost.toLowerCase().includes('free') ? 0 : 1;
          if (aFree !== bFree) return aFree - bFree;
        }
        const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        return (difficultyOrder[a.difficulty] || 1) - (difficultyOrder[b.difficulty] || 1);
      });

      skillCourses[skillId] = sorted;
    }
  }

  // Organize into phases
  const phases = [
    {
      id: 'quick-wins',
      name: 'Quick Wins',
      description: 'Get up to speed fast with these short, high-impact resources',
      timeframe: '1-2 weeks',
      icon: '⚡',
      items: [],
    },
    {
      id: 'core-skills',
      name: 'Core Skills',
      description: 'Build the essential competencies for your target role',
      timeframe: '1-2 months',
      icon: '🎯',
      items: [],
    },
    {
      id: 'advanced',
      name: 'Advanced & Specialization',
      description: 'Differentiate yourself with advanced knowledge and certifications',
      timeframe: '2-4 months',
      icon: '🚀',
      items: [],
    },
    {
      id: 'portfolio',
      name: 'Portfolio Projects',
      description: 'Apply your skills with hands-on projects that demonstrate expertise',
      timeframe: 'Ongoing',
      icon: '💼',
      items: [],
    },
  ];

  const addedCourseIds = new Set();

  for (const skill of missingSkills) {
    const skillId = typeof skill === 'string' ? skill : skill.id;
    const priority = (typeof skill === 'object' && skill.priority) || 'medium';
    const available = skillCourses[skillId] || [];

    for (const course of available) {
      if (addedCourseIds.has(course.id)) continue;
      addedCourseIds.add(course.id);

      const item = {
        courseId: course.id,
        title: course.title,
        provider: course.provider,
        url: course.url,
        duration: course.duration,
        cost: course.cost,
        type: course.type,
        difficulty: course.difficulty,
        targetSkill: skillId,
        priority,
      };

      // Categorize into phases
      if (course.type === 'project') {
        phases[3].items.push(item);
      } else if (course.difficulty === 'beginner' || parseDuration(course.duration) <= 10) {
        phases[0].items.push(item);
      } else if (course.difficulty === 'advanced' || course.type === 'certification') {
        phases[2].items.push(item);
      } else {
        phases[1].items.push(item);
      }
    }
  }

  // Sort items within each phase by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  for (const phase of phases) {
    phase.items.sort((a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1));
  }

  // Calculate totals
  const totalCourses = phases.reduce((sum, p) => sum + p.items.length, 0);
  const totalHours = phases.reduce((sum, p) => 
    sum + p.items.reduce((s, item) => s + parseDuration(item.duration), 0), 0
  );
  const freeCourses = phases.reduce((sum, p) => 
    sum + p.items.filter(item => item.cost.toLowerCase().includes('free')).length, 0
  );

  return {
    phases: phases.filter(p => p.items.length > 0),
    summary: {
      totalCourses,
      totalHours,
      freeCourses,
      paidCourses: totalCourses - freeCourses,
      estimatedWeeks: Math.ceil(totalHours / 15), // Assuming 15 hours/week
    },
  };
}

/**
 * AI-enhanced roadmap with personalized ordering and commentary
 */
export async function aiEnhancedRoadmap(missingSkills, userContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // First generate the base roadmap
  const baseRoadmap = generateRoadmap(missingSkills);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a career mentor. Given this learning roadmap, provide brief personalized advice.

MISSING SKILLS: ${missingSkills.map(s => typeof s === 'string' ? s : s.id).join(', ')}
TARGET ROLE: ${userContext?.targetRole || 'Not specified'}
CURRENT SKILLS: ${userContext?.currentSkills?.join(', ') || 'Not specified'}

Provide a JSON response with:
{
  "personalizedTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "learningOrder": ["<skill_id to learn first>", "<second>", "<third>"],
  "motivationalNote": "<short encouraging message>"
}`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const aiTips = JSON.parse(responseText);
    
    return {
      ...baseRoadmap,
      aiEnhanced: true,
      personalizedTips: aiTips.personalizedTips,
      suggestedOrder: aiTips.learningOrder,
      motivationalNote: aiTips.motivationalNote,
    };
  } catch {
    return { ...baseRoadmap, aiEnhanced: false };
  }
}

/**
 * Parse duration string like "40 hours" into a number
 */
function parseDuration(durationStr) {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 10;
}
