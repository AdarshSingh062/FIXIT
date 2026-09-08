const { calculatePriority } = require('../services/priorityEngine');
const { COMPLAINT_PRIORITY } = require('../config/constants');

describe('Smart Priority Engine', () => {
  it('should calculate Critical priority for live wire electrical hazard', () => {
    const result = calculatePriority({
      title: 'Live wire sparking near school gate',
      description: 'Exposed cable is dangling and sparking in the rain.',
      category: { name: 'Electrical & Power', defaultPriority: 'High' },
      isEmergency: true,
      publicImpact: true
    });

    expect(result.priority).toBe(COMPLAINT_PRIORITY.CRITICAL);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.reason).toContain('critical hazard trigger');
  });

  it('should calculate High priority for blocked main road and burst pipe', () => {
    const result = calculatePriority({
      title: 'Burst pipe flooding main street',
      description: 'Water gushing out rapidly causing traffic gridlock',
      category: { name: 'Water Leakage', defaultPriority: 'High' },
      isEmergency: false,
      publicImpact: true
    });

    expect([COMPLAINT_PRIORITY.HIGH, COMPLAINT_PRIORITY.CRITICAL]).toContain(result.priority);
    expect(result.score).toBeGreaterThanOrEqual(60);
  });

  it('should calculate Low/Medium priority for general public property or garbage', () => {
    const result = calculatePriority({
      title: 'Minor scratch on park bench',
      description: 'Someone drew graffiti on the wooden bench at central park.',
      category: { name: 'Public Property Damage', defaultPriority: 'Low' },
      isEmergency: false,
      publicImpact: false
    });

    expect(result.priority).toBe(COMPLAINT_PRIORITY.LOW);
    expect(result.score).toBeLessThan(40);
  });
});
