const { COMPLAINT_PRIORITY } = require('../config/constants');

// Critical emergency keyword patterns
const CRITICAL_KEYWORDS = [
  /\blive\s+wire(s)?\b/i,
  /\belectric(al)?\s+(spark|shock|fire|hazard)\b/i,
  /\bgas\s+leak(age)?\b/i,
  /\bexplosion\b/i,
  /\bcollapsed?\b/i,
  /\bburst\s+pipe\b/i,
  /\bflash\s+flood(ing)?\b/i,
  /\bdeep\s+manhole\b/i,
  /\bopen\s+sewer\b/i,
  /\bfire\b/i,
  /\btoxic\b/i,
  /\baccident\s+(prone|zone|hazard)\b/i
];

// High severity keyword patterns
const HIGH_KEYWORDS = [
  /\bblock(ed|age)?\s+main\s+road\b/i,
  /\btraffic\s+signal\s+(broken|down|failure)\b/i,
  /\bwater\s+contamination\b/i,
  /\bsewage\s+overflow(ing)?\b/i,
  /\bfallen\s+tree\b/i,
  /\bhospital\b/i,
  /\bschool\s+zone\b/i,
  /\bdangerous\b/i,
  /\bhazard\b/i
];

// Medium severity keyword patterns
const MEDIUM_KEYWORDS = [
  /\bpothole(s)?\b/i,
  /\bstreet\s*light\s+(off|not\s+working|flickering)\b/i,
  /\bgarbage\s+(pile|dump|overflowing)\b/i,
  /\bdrainage\s+clog\b/i,
  /\bleaking\s+tap\b/i
];

/**
 * Calculates priority score and rating automatically
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.description
 * @param {Object} [params.category] Category object with defaultPriority and name
 * @param {boolean} [params.isEmergency]
 * @param {boolean} [params.publicImpact]
 * @returns {{ priority: string, score: number, reason: string }}
 */
const calculatePriority = ({ title = '', description = '', category = null, isEmergency = false, publicImpact = false }) => {
  const combinedText = `${title} ${description}`;
  let score = 30; // base score
  const reasons = [];

  // 1. Check emergency flag
  if (isEmergency) {
    score += 45;
    reasons.push('User flagged as immediate emergency');
  }

  // 2. Category baseline weighting
  const categoryName = (category?.name || '').toLowerCase();
  if (categoryName.includes('electric') || categoryName.includes('traffic') || categoryName.includes('safety')) {
    score += 25;
    reasons.push(`Category '${category?.name}' has high safety risk weighting`);
  } else if (categoryName.includes('water') || categoryName.includes('drainage')) {
    score += 15;
    reasons.push(`Category '${category?.name}' has utility impact weighting`);
  } else if (category?.defaultPriority === COMPLAINT_PRIORITY.HIGH) {
    score += 20;
    reasons.push('Category default high priority');
  } else if (category?.defaultPriority === COMPLAINT_PRIORITY.CRITICAL) {
    score += 40;
    reasons.push('Category default critical priority');
  }

  // 3. Public impact weighting
  if (publicImpact) {
    score += 20;
    reasons.push('Affects large public gathering/transit area');
  }

  // 4. Keyword heuristic scoring
  let matchedCritical = false;
  for (const regex of CRITICAL_KEYWORDS) {
    if (regex.test(combinedText)) {
      score += 40;
      matchedCritical = true;
      const match = combinedText.match(regex)[0];
      reasons.push(`Contains critical hazard trigger: "${match}"`);
      break;
    }
  }

  if (!matchedCritical) {
    for (const regex of HIGH_KEYWORDS) {
      if (regex.test(combinedText)) {
        score += 25;
        const match = combinedText.match(regex)[0];
        reasons.push(`Contains high-risk trigger: "${match}"`);
        break;
      }
    }
  }

  // Cap score between 10 and 100
  score = Math.min(100, Math.max(10, score));

  // Determine priority enum
  let priority = COMPLAINT_PRIORITY.LOW;
  if (score >= 80) {
    priority = COMPLAINT_PRIORITY.CRITICAL;
  } else if (score >= 60) {
    priority = COMPLAINT_PRIORITY.HIGH;
  } else if (score >= 40) {
    priority = COMPLAINT_PRIORITY.MEDIUM;
  } else {
    priority = COMPLAINT_PRIORITY.LOW;
  }

  const reason = reasons.length > 0
    ? `Auto-assigned based on: ${reasons.join(', ')} (Score: ${score}/100)`
    : `Standard severity evaluation (Score: ${score}/100)`;

  return {
    priority,
    score,
    reason
  };
};

module.exports = {
  calculatePriority,
  CRITICAL_KEYWORDS,
  HIGH_KEYWORDS
};
