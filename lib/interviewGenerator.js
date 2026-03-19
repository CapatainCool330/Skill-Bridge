import { GoogleGenerativeAI } from '@google/generative-ai';

// Template-based interview questions (fallback)
const questionTemplates = {
  python: [
    { q: "Explain the difference between a list and a tuple in Python.", difficulty: "easy", topic: "Python Fundamentals" },
    { q: "What are Python decorators and when would you use them?", difficulty: "medium", topic: "Python Advanced" },
    { q: "How does Python's GIL (Global Interpreter Lock) affect multithreading?", difficulty: "hard", topic: "Python Internals" },
  ],
  javascript: [
    { q: "Explain the difference between `let`, `const`, and `var`.", difficulty: "easy", topic: "JavaScript Basics" },
    { q: "What is the event loop in JavaScript and how does it work?", difficulty: "medium", topic: "JavaScript Runtime" },
    { q: "Explain closures and provide a practical use case.", difficulty: "medium", topic: "JavaScript Core" },
  ],
  react: [
    { q: "What is the virtual DOM and why does React use it?", difficulty: "easy", topic: "React Fundamentals" },
    { q: "Explain the useEffect hook and its dependency array.", difficulty: "medium", topic: "React Hooks" },
    { q: "How would you optimize performance in a large React application?", difficulty: "hard", topic: "React Performance" },
  ],
  aws: [
    { q: "What is the difference between an EC2 instance and a Lambda function?", difficulty: "easy", topic: "AWS Compute" },
    { q: "Explain how VPC networking works in AWS.", difficulty: "medium", topic: "AWS Networking" },
    { q: "Design a highly available architecture for a web application on AWS.", difficulty: "hard", topic: "AWS Architecture" },
  ],
  docker: [
    { q: "What is the difference between an image and a container?", difficulty: "easy", topic: "Docker Basics" },
    { q: "How do multi-stage builds work and why are they useful?", difficulty: "medium", topic: "Docker Best Practices" },
  ],
  kubernetes: [
    { q: "What is a Pod in Kubernetes?", difficulty: "easy", topic: "K8s Fundamentals" },
    { q: "Explain the difference between a Deployment and a StatefulSet.", difficulty: "medium", topic: "K8s Workloads" },
    { q: "How does Kubernetes handle service discovery and load balancing?", difficulty: "hard", topic: "K8s Networking" },
  ],
  machine_learning: [
    { q: "What is the bias-variance tradeoff?", difficulty: "medium", topic: "ML Theory" },
    { q: "Explain the difference between supervised and unsupervised learning.", difficulty: "easy", topic: "ML Fundamentals" },
    { q: "How would you handle an imbalanced dataset?", difficulty: "medium", topic: "ML Practical" },
  ],
  sql: [
    { q: "What is the difference between INNER JOIN and LEFT JOIN?", difficulty: "easy", topic: "SQL Basics" },
    { q: "Explain database indexing and when to use it.", difficulty: "medium", topic: "Database Performance" },
  ],
  system_design: [
    { q: "Design a URL shortener service like bit.ly.", difficulty: "hard", topic: "System Design" },
    { q: "How would you design a rate limiter?", difficulty: "hard", topic: "System Design" },
  ],
  network_security: [
    { q: "What is the difference between symmetric and asymmetric encryption?", difficulty: "easy", topic: "Security Basics" },
    { q: "Explain how a firewall works and different types of firewalls.", difficulty: "medium", topic: "Network Security" },
  ],
  terraform: [
    { q: "What is Terraform state and why is it important?", difficulty: "easy", topic: "Terraform Basics" },
    { q: "Explain the difference between Terraform plan and apply.", difficulty: "easy", topic: "Terraform Workflow" },
  ],
  git: [
    { q: "What is the difference between git merge and git rebase?", difficulty: "medium", topic: "Git Advanced" },
    { q: "How would you resolve a merge conflict?", difficulty: "easy", topic: "Git Basics" },
  ],
};

/**
 * Rule-based interview question generation (fallback)
 */
export function generateRuleBasedQuestions(skills, count = 10) {
  const questions = [];
  
  for (const skillId of skills) {
    const templates = questionTemplates[skillId];
    if (templates) {
      for (const t of templates) {
        questions.push({
          question: t.q,
          difficulty: t.difficulty,
          topic: t.topic,
          skill: skillId,
        });
      }
    }
  }

  // Shuffle and limit
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * AI-powered interview question generation
 */
export async function generateAIQuestions(skills, targetRole, count = 8) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate ${count} technical interview questions for a ${targetRole} role.
The candidate has these skills: ${skills.join(', ')}

Focus questions on their skill areas and common interview topics for this role.

Respond with this exact JSON format (no markdown, just raw JSON):
{
  "questions": [
    {
      "question": "<interview question>",
      "difficulty": "easy|medium|hard",
      "topic": "<topic area>",
      "skill": "<related skill>",
      "hint": "<brief hint for answering>"
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  let responseText = result.response.text().trim();
  if (responseText.startsWith('```')) {
    responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  
  const parsed = JSON.parse(responseText);
  return parsed.questions || [];
}

/**
 * Main entry — tries AI, falls back to rule-based
 */
export async function generateInterviewQuestions(skills, targetRole, count = 8) {
  try {
    const aiQuestions = await generateAIQuestions(skills, targetRole, count);
    return { source: 'ai', questions: aiQuestions };
  } catch (error) {
    console.warn('AI interview generation failed, using templates:', error.message);
    const ruleBasedQuestions = generateRuleBasedQuestions(skills, count);
    return { source: 'rule-based', questions: ruleBasedQuestions, fallbackReason: error.message };
  }
}
