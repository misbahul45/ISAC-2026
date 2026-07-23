import { useRef } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'

const OTP_LENGTH = 6

type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  invalid?: boolean
}

export function OtpInput({ value, onChange, invalid }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const setDigit = (index: number, digit: string) => {
    const digits = value.padEnd(OTP_LENGTH, ' ').split('')
    digits[index] = digit || ' '
    onChange(digits.join('').replace(/\s/g, ''))
  }

  const handleChange = (index: number, rawValue: string) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1)
    setDigit(index, digit)

    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()

    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH)

    if (!pasted) return

    onChange(pasted)

    inputsRef.current[
      Math.min(pasted.length, OTP_LENGTH - 1)
    ]?.focus()
  }

  return (
    <div className="grid w-full grid-cols-6 gap-1.5 xs:gap-2 sm:gap-2.5">
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] ?? ''}
          onChange={(event) =>
            handleChange(index, event.target.value)
          }
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          aria-invalid={invalid}
          className="h-11 min-w-0 w-full rounded-lg border border-border/50 bg-background/60 text-center text-base font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 xs:h-12 xs:rounded-xl xs:text-lg sm:h-14 sm:text-xl"
        />
      ))}
    </div>
  )
}