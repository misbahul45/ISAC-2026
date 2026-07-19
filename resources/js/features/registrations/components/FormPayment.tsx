import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import {
  uploadPaymentSchema,
  type UploadPayemnetInput,
} from '../schemas/uploadPayment'
import { FileUpload } from '@/components/shared/FileUpload'

type Props = {
  /** URL gambar QR pembayaran (mis. QRIS), datang dari backend */
  qrImageUrl: string
  /** Total biaya pendaftaran dalam Rupiah */
  amount: number
  /** Dipanggil saat tombol "Terapkan" ditekan, buat validasi/apply promo ke backend */
  onApplyPromo?: (code: string) => Promise<void> | void
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)

const FormPayment = ({ qrImageUrl, amount, onApplyPromo }: Props) => {
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  const form = useForm<UploadPayemnetInput>({
    mode: 'onSubmit',
    resolver: zodResolver(uploadPaymentSchema),
    defaultValues: {
      promoCode: '',
      paymentProof: null,
    },
  })

  const handleApplyPromo = async () => {
    const code = form.getValues('promoCode')?.trim()

    if (!code) {
      form.setError('promoCode', { message: 'Masukkan kode voucher dulu' })
      return
    }

    setIsApplyingPromo(true)
    try {
      await onApplyPromo?.(code)
      toast.success('Kode promo diterapkan')
    } catch (err) {
      form.setError('promoCode', { message: 'Kode promo tidak valid' })
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const onSubmit = (values: UploadPayemnetInput) => {
    toast.loading('Menyimpan pembayaran...')

    router.post('/payments', values, {
      onSuccess: () => {
        toast.dismiss()
        toast.success('Pembayaran berhasil dikirim!')
      },
      onError: (errors) => {
        toast.dismiss()
        toast.error('Gagal mengirim pembayaran', {
          description: 'Periksa kembali data yang kamu masukkan.',
        })
        console.error(errors)
      },
    })
  }

  return (
    <form
      id="form-payment"
      onSubmit={form.handleSubmit(onSubmit)}
      className="relative isolate w-full overflow-hidden rounded-2xl"
    >
      {/* Border gradient — sama seperti Header: track statis + spin conic-gradient */}
      <span aria-hidden="true" className="header-border-track" />
      <span aria-hidden="true" className="header-border-spin" />

      <div className="relative z-10 rounded-[inherit] bg-background/60 px-6 py-8 backdrop-blur-sm">
        <div className="flex md:flex-row flex-col justify-center md:items-center gap-8 md:gap-10">
          <div className="flex justify-center w-full">
            <div className="w-full max-w-[260px] rounded-2xl border border-primary bg-background p-4">
              <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-foreground">
                Scan Pembayaran
              </p>
              <img
                src={qrImageUrl}
                alt="QR pembayaran"
                className="mx-auto aspect-square w-full rounded-lg bg-white p-2"
              />
            </div>
          </div>

          <FieldGroup className="gap-5">
            <div className="text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                Total Biaya Pendaftaran
              </p>
              <div className="inline-block rounded-full bg-primary px-8 py-3">
                <span className="text-2xl font-bold text-primary-foreground">
                  {formatRupiah(amount)}
                </span>
              </div>
            </div>

            <Controller
              name="promoCode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    Kode Promo Voucher
                  </FieldLabel>

                  <div className="flex gap-2">
                    <Input
                      {...field}
                      placeholder="Masukkan Kode Voucher"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                      className="flex-1 rounded-full bg-background py-5"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo}
                      className="rounded-full px-6 font-semibold"
                    >
                      {isApplyingPromo ? 'Mengecek...' : 'Terapkan'}
                    </Button>
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    label="Bukti Upload Twibbon"
                    subLabel="File PDF, Max File 10mb"
                    accept="application/pdf"
                    maxSizeMB={10}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </div>

        <div className="block ml-auto w-fit">
          <Button
            type="submit"
            form="form-payment"
            disabled={form.formState.isSubmitting}
            className="mt-8 rounded-md text-2xl font-bold py-6 px-6"
          >
            {form.formState.isSubmitting ? 'Mengirim...' : 'Kirim'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default FormPayment