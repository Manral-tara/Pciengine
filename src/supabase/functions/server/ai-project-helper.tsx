// Helper functions for AI project generation

export function extractProjectName(description: string): string {
  const lines = description.split('\n');
  const firstLine = lines[0].trim();
  
  // Look for "build a/an" or "create a/an" patterns
  const buildMatch = firstLine.match(/(?:build|create|develop)\s+(?:a|an)\s+([^,\.]+)/i);
  if (buildMatch) {
    return buildMatch[1].trim().replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Use first 50 chars if no pattern found
  return firstLine.slice(0, 50) + (firstLine.length > 50 ? '...' : '');
}

export function detectProjectType(description: string): string {
  if (description.includes('e-commerce') || description.includes('shop') || description.includes('cart')) {
    return 'ecommerce';
  }
  if (description.includes('mobile') || description.includes('app') || description.includes('ios') || description.includes('android')) {
    return 'mobile';
  }
  if (description.includes('saas') || description.includes('dashboard') || description.includes('analytics')) {
    return 'saas';
  }
  if (description.includes('api') || description.includes('backend') || description.includes('microservice')) {
    return 'api';
  }
  if (description.includes('health') || description.includes('medical') || description.includes('patient')) {
    return 'healthcare';
  }
  if (description.includes('payment') || description.includes('banking') || description.includes('financial')) {
    return 'fintech';
  }
  return 'default';
}

export function analyzeComplexity(description: string): 'low' | 'medium' | 'high' {
  const complexityKeywords = ['complex', 'advanced', 'enterprise', 'scalable', 'distributed', 'microservice'];
  const integrationKeywords = ['integration', 'api', 'third-party', 'payment', 'authentication'];
  
  const complexityScore = complexityKeywords.reduce((score, kw) => 
    description.includes(kw) ? score + 1 : score, 0);
  const integrationScore = integrationKeywords.reduce((score, kw) => 
    description.includes(kw) ? score + 1 : score, 0);
  
  const totalScore = complexityScore + integrationScore;
  
  if (totalScore >= 4) return 'high';
  if (totalScore >= 2) return 'medium';
  return 'low';
}

export function generateProjectTasks(description: string, projectType: string, complexity: 'low' | 'medium' | 'high'): any[] {
  const descLower = description.toLowerCase();
  const tasks = [];
  
  const complexityMultiplier = { low: 1, medium: 1.3, high: 1.6 }[complexity];
  
  // Always include foundational tasks
  tasks.push({
    taskName: 'Project Setup & Architecture',
    ISR: Math.ceil(3 * complexityMultiplier),
    CF: 1.2,
    UXI: 1.1,
    RCF: 1.2,
    AEP: Math.ceil(5 * complexityMultiplier),
    L: 1,
    MLW: 1.3,
    CGW: 1.2,
    RF: 1.1,
    S: 1.2,
    GLRI: 1.3,
    aiVerifiedUnits: Math.ceil(15 * complexityMultiplier),
  });
  
  // Add conditional tasks based on description keywords
  if (descLower.includes('auth') || descLower.includes('login') || descLower.includes('user')) {
    tasks.push({
      taskName: 'User Authentication & Authorization',
      ISR: Math.ceil(4 * complexityMultiplier),
      CF: 1.4,
      UXI: 1.6,
      RCF: 1.8,
      AEP: Math.ceil(8 * complexityMultiplier),
      L: 2,
      MLW: 1.5,
      CGW: 1.3,
      RF: 1.6,
      S: 1.4,
      GLRI: 1.8,
      aiVerifiedUnits: Math.ceil(35 * complexityMultiplier),
    });
  }
  
  if (descLower.includes('database') || descLower.includes('data') || descLower.includes('storage')) {
    tasks.push({
      taskName: 'Database Design & Implementation',
      ISR: Math.ceil(5 * complexityMultiplier),
      CF: 1.5,
      UXI: 1.2,
      RCF: 1.4,
      AEP: Math.ceil(10 * complexityMultiplier),
      L: 2,
      MLW: 1.6,
      CGW: 1.4,
      RF: 1.3,
      S: 1.5,
      GLRI: 1.4,
      aiVerifiedUnits: Math.ceil(45 * complexityMultiplier),
    });
  }
  
  if (descLower.includes('api') || descLower.includes('backend') || descLower.includes('endpoint')) {
    tasks.push({
      taskName: 'API Development & Integration',
      ISR: Math.ceil(6 * complexityMultiplier),
      CF: 1.6,
      UXI: 1.3,
      RCF: 1.5,
      AEP: Math.ceil(12 * complexityMultiplier),
      L: 2,
      MLW: 1.7,
      CGW: 1.5,
      RF: 1.4,
      S: 1.6,
      GLRI: 1.5,
      aiVerifiedUnits: Math.ceil(55 * complexityMultiplier),
    });
  }
  
  if (descLower.includes('ui') || descLower.includes('interface') || descLower.includes('design') || descLower.includes('responsive')) {
    tasks.push({
      taskName: 'User Interface & UX Design',
      ISR: Math.ceil(5 * complexityMultiplier),
      CF: 1.4,
      UXI: 2.0,
      RCF: 1.2,
      AEP: Math.ceil(8 * complexityMultiplier),
      L: 1,
      MLW: 1.4,
      CGW: 1.3,
      RF: 1.2,
      S: 1.3,
      GLRI: 1.3,
      aiVerifiedUnits: Math.ceil(40 * complexityMultiplier),
    });
  }
  
  if (descLower.includes('payment') || descLower.includes('stripe') || descLower.includes('checkout')) {
    tasks.push({
      taskName: 'Payment Processing Integration',
      ISR: Math.ceil(4 * complexityMultiplier),
      CF: 1.7,
      UXI: 1.5,
      RCF: 2.0,
      AEP: Math.ceil(10 * complexityMultiplier),
      L: 3,
      MLW: 1.6,
      CGW: 1.4,
      RF: 1.8,
      S: 1.7,
      GLRI: 2.0,
      aiVerifiedUnits: Math.ceil(50 * complexityMultiplier),
    });
  }
  
  if (descLower.includes('search') || descLower.includes('filter')) {
    tasks.push({
      taskName: 'Search & Filtering System',
      ISR: Math.ceil(4 * complexityMultiplier),
      CF: 1.5,
      UXI: 1.6,
      RCF: 1.3,
      AEP: Math.ceil(7 * complexityMultiplier),
      L: 2,
      MLW: 1.5,
      CGW: 1.3,
      RF: 1.2,
      S: 1.4,
      GLRI: 1.3,
      aiVerifiedUnits: Math.ceil(30 * complexityMultiplier),
    });
  }
  
  if (descLower.includes('admin') || descLower.includes('dashboard') || descLower.includes('management')) {
    tasks.push({
      taskName: 'Admin Dashboard & Management',
      ISR: Math.ceil(7 * complexityMultiplier),
      CF: 1.5,
      UXI: 1.7,
      RCF: 1.4,
      AEP: Math.ceil(12 * complexityMultiplier),
      L: 2,
      MLW: 1.6,
      CGW: 1.4,
      RF: 1.3,
      S: 1.5,
      GLRI: 1.4,
      aiVerifiedUnits: Math.ceil(60 * complexityMultiplier),
    });
  }
  
  if (descLower.includes('notification') || descLower.includes('email') || descLower.includes('alert')) {
    tasks.push({
      taskName: 'Notification System',
      ISR: Math.ceil(3 * complexityMultiplier),
      CF: 1.3,
      UXI: 1.4,
      RCF: 1.3,
      AEP: Math.ceil(6 * complexityMultiplier),
      L: 1,
      MLW: 1.4,
      CGW: 1.3,
      RF: 1.2,
      S: 1.3,
      GLRI: 1.3,
      aiVerifiedUnits: Math.ceil(25 * complexityMultiplier),
    });
  }
  
  // Always include these
  tasks.push({
    taskName: 'Testing & Quality Assurance',
    ISR: Math.ceil(4 * complexityMultiplier),
    CF: 1.3,
    UXI: 1.2,
    RCF: 1.5,
    AEP: Math.ceil(8 * complexityMultiplier),
    L: 1,
    MLW: 1.4,
    CGW: 1.3,
    RF: 1.4,
    S: 1.3,
    GLRI: 1.5,
    aiVerifiedUnits: Math.ceil(30 * complexityMultiplier),
  });
  
  tasks.push({
    taskName: 'Deployment & DevOps Setup',
    ISR: Math.ceil(3 * complexityMultiplier),
    CF: 1.4,
    UXI: 1.1,
    RCF: 1.6,
    AEP: Math.ceil(7 * complexityMultiplier),
    L: 2,
    MLW: 1.5,
    CGW: 1.3,
    RF: 1.5,
    S: 1.4,
    GLRI: 1.6,
    aiVerifiedUnits: Math.ceil(28 * complexityMultiplier),
  });
  
  return tasks;
}
