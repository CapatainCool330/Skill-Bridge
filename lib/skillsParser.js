import skillsTaxonomy from '@/data/skillsTaxonomy.json';

// Flatten all skills from taxonomy for quick lookup
function buildSkillIndex() {
  const index = {};
  for (const category of skillsTaxonomy.categories) {
    for (const skill of category.skills) {
      // Map the skill id and name
      index[skill.id] = { ...skill, category: category.name, categoryId: category.id };
      index[skill.name.toLowerCase()] = { ...skill, category: category.name, categoryId: category.id };
      // Map all aliases
      for (const alias of skill.aliases) {
        index[alias.toLowerCase()] = { ...skill, category: category.name, categoryId: category.id };
      }
    }
  }
  return index;
}

const skillIndex = buildSkillIndex();

/**
 * Parse free-text resume content and extract skills
 * Uses keyword matching against the skills taxonomy
 */
export function parseResumeText(text) {
  if (!text || typeof text !== 'string') {
    return { extractedSkills: [], confidence: 0, rawText: '' };
  }

  const normalizedText = text.toLowerCase();
  const foundSkills = new Map(); // skillId -> skill object

  for (const category of skillsTaxonomy.categories) {
    for (const skill of category.skills) {
      const termsToSearch = [skill.name.toLowerCase(), ...skill.aliases.map(a => a.toLowerCase())];
      
      for (const term of termsToSearch) {
        // Word-boundary-aware matching
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?:^|[\\s,;|/()\\[\\]])${escapedTerm}(?:$|[\\s,;|/()\\[\\]])`, 'i');
        
        if (regex.test(normalizedText) || normalizedText.includes(term)) {
          if (!foundSkills.has(skill.id)) {
            foundSkills.set(skill.id, {
              id: skill.id,
              name: skill.name,
              category: category.name,
              categoryId: category.id,
            });
          }
        }
      }
    }
  }

  const extractedSkills = Array.from(foundSkills.values());
  
  // Confidence: based on how many skills we found relative to typical resume
  const confidence = Math.min(100, Math.round((extractedSkills.length / 8) * 100));

  return {
    extractedSkills,
    confidence: Math.min(confidence, 95), // Cap at 95% since rule-based isn't perfect
    rawText: text,
  };
}

/**
 * Parse a structured skills list (array of strings)
 * Normalizes each skill against the taxonomy
 */
export function parseSkillsList(skills) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return { extractedSkills: [], confidence: 0 };
  }

  const matched = [];
  const unmatched = [];

  for (const skill of skills) {
    const normalized = skill.toLowerCase().trim();
    const found = skillIndex[normalized];
    
    if (found) {
      matched.push({
        id: found.id,
        name: found.name,
        category: found.category,
        categoryId: found.categoryId,
      });
    } else {
      unmatched.push(skill);
    }
  }

  // Dedupe by id
  const uniqueSkills = [...new Map(matched.map(s => [s.id, s])).values()];

  return {
    extractedSkills: uniqueSkills,
    unmatchedTerms: unmatched,
    confidence: skills.length > 0 ? Math.round((uniqueSkills.length / skills.length) * 100) : 0,
  };
}

/**
 * Get all skills from taxonomy grouped by category
 */
export function getAllSkills() {
  return skillsTaxonomy.categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    skills: cat.skills.map(s => ({ id: s.id, name: s.name })),
  }));
}

/**
 * Look up a skill by its ID
 */
export function getSkillById(skillId) {
  return skillIndex[skillId] || null;
}
