import { z } from "zod";

// Hasil upload yang disimpan di form (dari response uploadFiles UploadThing)
export const paymentProofSchema = z.object({
  id: z.string().uuid(),
  fileId: z.string().min(1),
  url: z.string().url(),
  name: z.string().optional(),
});

export const uploadPaymentSchema = z
  .object({
    promoCode: z
      .string()
      .trim()
      .max(30, "Kode promo maksimal 30 karakter")
      .optional(),
    paymentProof: paymentProofSchema.nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.paymentProof) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bukti pembayaran wajib diupload",
        path: ["paymentProof"],
      });
    }
  });

export type PaymentProof = z.infer<typeof paymentProofSchema>;
export type UploadPayemnetInput = z.infer<typeof uploadPaymentSchema>;
