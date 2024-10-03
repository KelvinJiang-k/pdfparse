import { z } from 'zod'

export const SendmessageValidator = z.object({
  fileId: z.string(),
  message: z.string(),
})
