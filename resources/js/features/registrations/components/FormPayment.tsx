import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { FileUpload } from '@/components/shared/FileUpload'
import { uploadPaymentSchema, type UploadPaymentInput } from '../schemas/uploadPayment'
import type { ExternalFile, PaymentFormValues, PaymentMethod } from '../types/registrationTypes'

type Props = {
  qrImageUrl: string | null
  amount: number
  paymentMethods: PaymentMethod[]
  instructions: string | null
  existingProof: ExternalFile | null
  isSubmitting: boolean
  onSubmit: (values: PaymentFormValues) => Promise<void>
}

const methodLabels: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Transfer Bank',
  QRIS: 'QRIS',
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)

const FormPayment = ({
  qrImageUrl,
  amount,
  paymentMethods,
  instructions,
  existingProof,
  isSubmitting,
  onSubmit,
}: Props) => {
  const form = useForm<UploadPaymentInput>({
    mode: 'onChange',
    resolver: zodResolver(uploadPaymentSchema),
    defaultValues: {
      payment_method: paymentMethods[0] ?? 'QRIS',
      transaction_id: '',
      paymentProof: existingProof,
    },
  })

  const handleSubmit = async (values: UploadPaymentInput) => {
    if (!values.paymentProof) return
    await onSubmit({
      payment_method: values.payment_method,
      transaction_id: values.transaction_id || undefined,
      payment_proof_file_id: values.paymentProof.id,
    })
  }

  return (
    <form id="form-payment" onSubmit={form.handleSubmit(handleSubmit)} className="relative isolate w-full overflow-hidden rounded-2xl">
      <span aria-hidden="true" className="header-border-track" />
      <span aria-hidden="true" className="header-border-spin" />

      <div className="relative z-10 rounded-[inherit] bg-background/60 px-6 py-8 backdrop-blur-sm">
        <div className="flex md:flex-row flex-col justify-center md:items-center gap-8 md:gap-10">
          <div className="flex justify-center w-full">
            <div className="w-full max-w-[260px] rounded-2xl border border-primary bg-background p-4">
              <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-foreground">Pembayaran</p>
              {qrImageUrl ? (
                <img src={qrImageUrl} alt="QR pembayaran" className="mx-auto aspect-square w-full rounded-lg bg-white p-2" />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg bg-white/5 p-4 text-center text-sm text-muted-foreground">
                  Gunakan instruksi pembayaran dari panitia
                </div>
              )}
            </div>
          </div>

          <FieldGroup className="gap-5">
            <div className="text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">Total Biaya Pendaftaran</p>
              <div className="inline-block rounded-full bg-primary px-8 py-3">
                <span className="text-2xl font-bold text-primary-foreground">{formatRupiah(amount)}</span>
              </div>
              {instructions && <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{instructions}</p>}
            </div>

            <Controller
              name="payment_method"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm font-semibold uppercase tracking-wide text-foreground">Metode Pembayaran</FieldLabel>
                  <select {...field} className="w-full rounded-full border border-input bg-background px-4 py-3 text-foreground" aria-invalid={fieldState.invalid}>
                    {paymentMethods.map((method) => <option key={method} value={method}>{methodLabels[method]}</option>)}
                  </select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="transaction_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm font-semibold uppercase tracking-wide text-foreground">ID Transaksi</FieldLabel>
                  <Input {...field} placeholder="Opsional" autoComplete="off" aria-invalid={fieldState.invalid} className="rounded-full bg-background py-5" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="paymentProof"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FileUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder="/payment-proofs"
                    label="Upload Bukti Pembayaran"
                    subLabel="PDF, JPG, PNG, atau WebP maksimal 10 MB"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    maxSizeMB={10}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </div>

        <div className="block ml-auto w-fit">
          <Button type="submit" form="form-payment" disabled={isSubmitting} className="mt-8 rounded-md text-2xl font-bold py-6 px-6">
            {isSubmitting ? 'Mengirim...' : 'Kirim'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default FormPayment
