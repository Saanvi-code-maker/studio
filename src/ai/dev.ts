import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-common-misconceptions.ts';
import '@/ai/flows/generate-student-explanation.ts';
import '@/ai/flows/analyze-student-answer.ts';
