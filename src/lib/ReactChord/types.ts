import type { Chord } from "svguitar";
import { z } from "zod";

export type ChordPlus = Chord & { tuning?: string[] };

export const zChordExtraSettings = z.object({
  showFingerings: z.boolean().default(false),
  showNoteNames: z.boolean().default(false),
});
export type ChordExtraSettings = z.infer<typeof zChordExtraSettings>;
