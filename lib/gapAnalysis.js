import jobRoles from '@/data/jobRoles.json';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * RULE-BASED Gap Analysis (Fallback)
 * Compares user skills against job role requirements using set operations & Jaccard similarity
 */
export function ruleBasedGapAnalysis(userSkillIds, targetRoleId) {
  // Get all jobs matching the target role prefix (e.g., "cloud-eng" matches all cloud engineer roles)
  const rolePrefix = targetRoleId;
  const matchingJobs = jobRoles.filter(job =>
    job.id.startsWith(rolePrefix) || job.title.toLowerCase().includes(rolePrefix.toLowerCase())
  );

  if (matchingJobs.length === 0) {
    return { error: 'No matching job descriptions found for this role.' };
  }

  // Aggregate required and nice-to-have skills across all matching jobs
  const requiredSkillCounts = {};
  const niceToHaveSkillCounts = {};

  for (const job of matchingJobs) {
    for (const skill of job.requiredSkills) {
      requiredSkillCounts[skill] = (requiredSkillCounts[skill] || 0) + 1;
    }
    for (const skill of job.niceToHaveSkills || []) {
      niceToHaveSkillCounts[skill] = (niceToHaveSkillCounts[skill] || 0) + 1;
    }
  }

  const userSkillSet = new Set(userSkillIds);

  // Categorize skills
  const matchedSkills = [];
  const missingCritical = [];
  const missingNiceToHave = [];
  const transferableSkills = [];

  // Check required skills
  for (const [skillId, count] of Object.entries(requiredSkillCounts)) {
    const frequency = count / matchingJobs.length;
    if (userSkillSet.has(skillId)) {
      matchedSkills.push({ id: skillId, frequency: Math.round(frequency * 100), type: 'required' });
    } else {
      missingCritical.push({ id: skillId, frequency: Math.round(frequency * 100), type: 'required', priority: frequency >= 0.7 ? 'high' : frequency >= 0.4 ? 'medium' : 'low' });
    }
  }

  // Check nice-to-have skills
  for (const [skillId, count] of Object.entries(niceToHaveSkillCounts)) {
    const frequency = count / matchingJobs.length;
    if (userSkillSet.has(skillId)) {
      matchedSkills.push({ id: skillId, frequency: Math.round(frequency * 100), type: 'nice-to-have' });
    } else if (!requiredSkillCounts[skillId]) {
      missingNiceToHave.push({ id: skillId, frequency: Math.round(frequency * 100), type: 'nice-to-have', priority: 'low' });
    }
  }

  // Find transferable skills (user has skills not in the role requirements but still valuable)
  for (const skillId of userSkillIds) {
    if (!requiredSkillCounts[skillId] && !niceToHaveSkillCounts[skillId]) {
      transferableSkills.push({ id: skillId, type: 'transferable' });
    }
  }

  // Sort missing skills by frequency (most commonly required first)
  missingCritical.sort((a, b) => b.frequency - a.frequency);
  missingNiceToHave.sort((a, b) => b.frequency - a.frequency);

  // Calculate overall fit score using Jaccard-inspired approach
  const allRequiredSkills = Object.keys(requiredSkillCounts);
  const matchedRequiredCount = matchedSkills.filter(s => s.type === 'required').length;
  const overallFitScore = allRequiredSkills.length > 0
    ? Math.round((matchedRequiredCount / allRequiredSkills.length) * 100)
    : 0;

  return {
    source: 'rule-based',
    confidence: 75,
    overallFitScore,
    matchedSkills,
    missingCritical,
    missingNiceToHave,
    transferableSkills,
    jobsAnalyzed: matchingJobs.length,
    recommendations: generateRecommendations(overallFitScore, missingCritical, matchedSkills),
  };
}

/**
 * AI-POWERED Gap Analysis using Google Gemini
 */
export async function aiGapAnalysis(userSkillIds, targetRoleId, userSkillNames) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  // Get matching jobs for context
  const matchingJobs = jobRoles.filter(job =>
    job.id.startsWith(targetRoleId) || job.title.toLowerCase().includes(targetRoleId.toLowerCase())
  );

  const jobContext = matchingJobs.slice(0, 10).map(j =>
    `${j.title} at ${j.company} (${j.seniority}): Required: ${j.requiredSkills.join(', ')}. Nice-to-have: ${j.niceToHaveSkills.join(', ')}`
  ).join('\n');

  const prompt = `You are a career advisor AI. Analyze the gap between a candidate's current skills and their target role.

CANDIDATE'S CURRENT SKILLS:
${userSkillNames.join(', ')}

TARGET ROLE: ${targetRoleId}

JOB DESCRIPTIONS FOR THIS ROLE:
${jobContext}

Respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "overallFitScore": <number 0-100>,
  "summary": "<2-3 sentence assessment>",
  "matchedSkills": [{"id": "<skill_id>", "relevance": "<why this skill matters>"}],
  "missingCritical": [{"id": "<skill_id>", "priority": "high|medium|low", "reason": "<why this is important>"}],
  "missingNiceToHave": [{"id": "<skill_id>", "priority": "low", "reason": "<why this would help>"}],
  "transferableSkills": [{"id": "<skill_id>", "transferTo": "<how this transfers>"}],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<recommendation 3>"]
}

Be specific and actionable. Use the skill IDs from the job descriptions.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Clean the response - remove markdown code blocks if present
  let cleanedResponse = responseText.trim();
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const aiResult = JSON.parse(cleanedResponse);

  return {
    source: 'ai',
    confidence: 88,
    overallFitScore: aiResult.overallFitScore,
    summary: aiResult.summary,
    matchedSkills: aiResult.matchedSkills || [],
    missingCritical: aiResult.missingCritical || [],
    missingNiceToHave: aiResult.missingNiceToHave || [],
    transferableSkills: aiResult.transferableSkills || [],
    recommendations: aiResult.recommendations || [],
    jobsAnalyzed: matchingJobs.length,
  };
}

/**
 * Main entry point — tries AI first, falls back to rule-based
 */
export async function performGapAnalysis(userSkillIds, targetRoleId, userSkillNames, forceRuleBased = false) {
  if (forceRuleBased) {
    return ruleBasedGapAnalysis(userSkillIds, targetRoleId);
  }

  try {
    const aiResult = await aiGapAnalysis(userSkillIds, targetRoleId, userSkillNames);
    return aiResult;
  } catch (error) {
    console.warn('AI gap analysis failed, falling back to rule-based:', error.message);
    const fallbackResult = ruleBasedGapAnalysis(userSkillIds, targetRoleId);
    fallbackResult.fallbackReason = error.message;
    return fallbackResult;
  }
}

/**
 * Generate human-readable recommendations based on analysis
 */
function generateRecommendations(fitScore, missingCritical, matchedSkills) {
  const recommendations = [];

  if (fitScore >= 80) {
    recommendations.push('You\'re a strong match! Focus on the few remaining gaps to make your profile even more competitive.');
  } else if (fitScore >= 50) {
    recommendations.push('You have a solid foundation. Prioritize the high-frequency missing skills to significantly improve your fit score.');
  } else {
    recommendations.push('There\'s a meaningful gap to bridge, but don\'t be discouraged. Start with the top 3 most-requested missing skills.');
  }

  const highPriority = missingCritical.filter(s => s.priority === 'high');
  if (highPriority.length > 0) {
    recommendations.push(`Focus first on these high-priority skills: ${highPriority.slice(0, 3).map(s => s.id).join(', ')}. They appear in ${highPriority[0]?.frequency}%+ of job descriptions.`);
  }

  if (matchedSkills.length > 0) {
    recommendations.push(`Leverage your ${matchedSkills.length} matched skills in your resume and interviews. These are your competitive advantage.`);
  }

  recommendations.push('Combine online courses with hands-on projects to build a portfolio that demonstrates practical experience.');

  return recommendations;
}

/**
 * Get available target roles (unique role categories)
 */
export function getTargetRoles() {
  const roleMap = {};
  for (const job of jobRoles) {
    const key = job.id.replace(/-\d+$/, '');
    if (!roleMap[key]) {
      roleMap[key] = {
        id: key,
        title: job.title.replace(/(Junior|Senior|Lead)\s*/i, '').trim(),
        count: 0,
        seniorities: new Set(),
      };
    }
    roleMap[key].count++;
    roleMap[key].seniorities.add(job.seniority);
  }

  return Object.values(roleMap).map(r => ({
    id: r.id,
    title: r.title,
    jobCount: r.count,
    seniorities: [...r.seniorities],
  }));
}
