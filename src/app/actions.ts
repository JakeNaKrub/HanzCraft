'use server';

import {
  generateCharacterSuggestions,
  type GenerateCharacterSuggestionsOutput,
} from '@/ai/flows/generate-character-suggestions';
import { z } from 'zod';

const SuggestionsResultSchema = z.object({
  suggestedCharacters: z.array(z.string()),
});

export async function getCharacterSuggestionsAction(radicals: string[]): Promise<GenerateCharacterSuggestionsOutput> {
  if (!radicals || radicals.length === 0) {
    return { suggestedCharacters: [] };
  }

  try {
    const result = await generateCharacterSuggestions({ radicals });
    const parsed = SuggestionsResultSchema.safeParse(result);
    if(parsed.success) {
        return parsed.data;
    }
    console.error('AI suggestion parsing error:', parsed.error);
    return { suggestedCharacters: [] };

  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    // Return a default value or throw a client-safe error
    return { suggestedCharacters: [] };
  }
}
