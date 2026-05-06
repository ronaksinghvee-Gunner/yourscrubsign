export const ZODIAC = [
  { name: "Aries", glyph: "♈", dates: "Mar 21 – Apr 19" },
  { name: "Taurus", glyph: "♉", dates: "Apr 20 – May 20" },
  { name: "Gemini", glyph: "♊", dates: "May 21 – Jun 20" },
  { name: "Cancer", glyph: "♋", dates: "Jun 21 – Jul 22" },
  { name: "Leo", glyph: "♌", dates: "Jul 23 – Aug 22" },
  { name: "Virgo", glyph: "♍", dates: "Aug 23 – Sep 22" },
  { name: "Libra", glyph: "♎", dates: "Sep 23 – Oct 22" },
  { name: "Scorpio", glyph: "♏", dates: "Oct 23 – Nov 21" },
  { name: "Sagittarius", glyph: "♐", dates: "Nov 22 – Dec 21" },
  { name: "Capricorn", glyph: "♑", dates: "Dec 22 – Jan 19" },
  { name: "Aquarius", glyph: "♒", dates: "Jan 20 – Feb 18" },
  { name: "Pisces", glyph: "♓", dates: "Feb 19 – Mar 20" },
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
