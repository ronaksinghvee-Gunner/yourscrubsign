export const ZODIAC = [
  { name: "Aries", glyph: "♈" },
  { name: "Taurus", glyph: "♉" },
  { name: "Gemini", glyph: "♊" },
  { name: "Cancer", glyph: "♋" },
  { name: "Leo", glyph: "♌" },
  { name: "Virgo", glyph: "♍" },
  { name: "Libra", glyph: "♎" },
  { name: "Scorpio", glyph: "♏" },
  { name: "Sagittarius", glyph: "♐" },
  { name: "Capricorn", glyph: "♑" },
  { name: "Aquarius", glyph: "♒" },
  { name: "Pisces", glyph: "♓" },
] as const;

export const WORDS = [
  "Exhausted","Invisible","Understaffed","Still showing up",
  "Running on spite","Burned out","New and terrified","Thinking of leaving",
  "Night shift brain","Underpaid","Emotionally done","Here for the chaos",
] as const;

export const SPECIALTIES = ["ICU","ER","L&D","Peds","OR","Psych","Travel"] as const;

export type ZodiacName = typeof ZODIAC[number]["name"];
export type Specialty = typeof SPECIALTIES[number];

export const FALLBACK_AFFIRMATION = "You showed up. That counts.";

export function fallbackReading(sign: string, specialty: string) {
  return {
    long_reading: `The stars are still aligning, ${sign}. Mercury is doing whatever Mercury does, the moon is somewhere unhelpful, and your shift is going to be what it's going to be. Drink water. Chart later. The universe sees you, even if your charge nurse doesn't. Today asks for nothing more than the bare minimum, executed with grim competence.`,
    specialty_line: `${specialty}: protect your peace. Your scrubs are not a uniform — they're armor.`,
    affirmation: FALLBACK_AFFIRMATION,
  };
}
