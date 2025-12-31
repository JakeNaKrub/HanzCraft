export interface Radical {
  id: string;
  symbol: string;
  name: string;
}

export interface CharacterComposition {
  character: string;
  // Represents a 2x2 grid. `null` signifies an empty slot.
  // [topLeft, topRight, bottomLeft, bottomRight]
  components: (string | null)[];
  pinyin: string;
  meaning:string;
  usage: string;
}

export interface Challenge {
  id: string;
  targetCharacter: string;
  pinyin: string;
  meaning: string;
  allowedRadicals: string[];
}
