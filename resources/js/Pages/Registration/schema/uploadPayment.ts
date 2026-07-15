import * as z from 'zod'

export const uploadPaymentSchema = z.object({
  code_promo: z.string().optional(),
  price: z.number().positive(),
})

export type UploadPayemnetInput = z.infer<typeof uploadPaymentSchema>