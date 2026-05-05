import { z } from 'zod';

export const SettingsDtoSchema = z.object({}).passthrough();

export type SettingsDto = z.infer<typeof SettingsDtoSchema>;
