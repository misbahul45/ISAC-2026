import { z } from 'zod'

export const paymentProofSchema = z.object({
  id: z.string().uuid(),
  fileId: z.string().min(1),
  url: z.string().url(),
  name: z.string().optional(),
})

export const uploadPaymentSchema = z.object({
  payment_method: z.enum(['BANK_TRANSFER', 'QRIS']),
  transaction_id: z.string().trim().max(100, 'ID transaksi maksimal 100 karakter'),
  paymentProof: paymentProofSchema.nullable().refine(Boolean, 'Bukti pembayaran wajib diunggah'),
})

export type PaymentProof = z.infer<typeof paymentProofSchema>
export type UploadPaymentInput = z.infer<typeof uploadPaymentSchema>
