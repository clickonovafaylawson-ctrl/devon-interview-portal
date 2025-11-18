import { z } from 'zod';

export const candidateFormSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  mobile: z.string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
});

export const fileValidation = {
  resume: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword' // .doc
    ]
  },
  video: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'video/mp4',
      'video/quicktime', // .mov
      'video/x-msvideo' // .avi
    ]
  }
};

export type CandidateFormData = z.infer<typeof candidateFormSchema>;