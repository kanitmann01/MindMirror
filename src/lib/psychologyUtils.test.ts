import { calculateOCEAN, determineArchetype, ARCHETYPES, updateScoresWithMedia, updateScoresWithMood } from './psychologyUtils';

describe('Psychology Utils', () => {
  
  describe('calculateOCEAN', () => {
    it('should calculate correct scores for basic inputs', () => {
      const answers = {
        'q1': 5, // Openness (Forward) -> 5
        'q2': 5, // Conscientiousness (Forward) -> 5
        'q3': 5, // Extraversion (Forward) -> 5
        'q4': 5, // Agreeableness (Forward) -> 5
        'q5': 5, // Neuroticism (Forward) -> 5
        'q6': 5, // Openness (Forward) -> 5
        'q7': 5, // Conscientiousness (Forward) -> 5
        'q8': 1, // Extraversion (Reverse) -> 6-1 = 5
        'q9': 1, // Agreeableness (Reverse) -> 6-1 = 5
        'q10': 1 // Neuroticism (Reverse) -> 6-1 = 5
      };
      
      // Total for each: 10. Count: 2. Average: 5. Scaled (*20): 100.
      const scores = calculateOCEAN(answers);
      expect(scores).toEqual({
        openness: 100,
        conscientiousness: 100,
        extraversion: 100,
        agreeableness: 100,
        neuroticism: 100
      });
    });

    it('should handle partial answers', () => {
        const answers = {
          'q1': 3 // Openness -> 3. Scaled: 60
        };
        const scores = calculateOCEAN(answers);
        expect(scores.openness).toBe(60);
        expect(scores.extraversion).toBe(0);
    });
  });

  describe('determineArchetype', () => {
    it('should identify EXPLORER', () => {
      const scores = { openness: 80, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };
      expect(determineArchetype(scores)).toBe(ARCHETYPES.EXPLORER);
    });
    
    it('should identify SENTINEL', () => {
      const scores = { openness: 40, conscientiousness: 80, extraversion: 50, agreeableness: 50, neuroticism: 50 };
      expect(determineArchetype(scores)).toBe(ARCHETYPES.SENTINEL);
    });

    it('should identify ANALYST for low extraversion/neuroticism', () => {
        const scores = { openness: 10, conscientiousness: 10, extraversion: 10, agreeableness: 10, neuroticism: 10 };
        expect(determineArchetype(scores)).toBe(ARCHETYPES.ANALYST);
    });

    it('should fallback to EXPLORER for middling scores', () => {
        const scores = { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };
        expect(determineArchetype(scores)).toBe(ARCHETYPES.EXPLORER);
    });
  });

  describe('updateScoresWithMedia', () => {
     it('should increase openness for learning intent', () => {
         const initial = { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };
         const media = [{ intent: ['learning'] }];
         const updated = updateScoresWithMedia(initial, media);
         // weight is 0.5. 50 + 0.5 = 50.5 -> rounded to 51
         expect(updated.openness).toBe(51);
     });

     it('should cap scores at 100', () => {
        const initial = { openness: 100, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };
        const media = [{ intent: ['learning'] }];
        const updated = updateScoresWithMedia(initial, media);
        expect(updated.openness).toBe(100);
    });
  });

  describe('updateScoresWithMood', () => {
      it('should decrease neuroticism when Happy', () => {
        const initial = { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };
        const entry = { mood: 'Happy', intensity: 5 };
        const updated = updateScoresWithMood(initial, entry);
        // Happy: Extraversion +1, Neuroticism -1
        expect(updated.extraversion).toBe(51);
        expect(updated.neuroticism).toBe(49);
      });
  });

});

