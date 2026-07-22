export type InstitutionAddress = {
  province: string
  city: string
  address: string
}

export const emptyInstitutionAddress = (): InstitutionAddress => ({
  province: '',
  city: '',
  address: '',
})

export function parseInstitutionAddress(
  value: string | null | undefined,
): InstitutionAddress {
  if (!value) return emptyInstitutionAddress()

  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null) {
      return emptyInstitutionAddress()
    }

    const address = parsed as Record<string, unknown>

    return {
      province: typeof address.province === 'string' ? address.province : '',
      city: typeof address.city === 'string' ? address.city : '',
      address: typeof address.address === 'string' ? address.address : '',
    }
  } catch {
    return emptyInstitutionAddress()
  }
}

export function serializeInstitutionAddress(
  value: InstitutionAddress,
): string {
  return JSON.stringify({
    province: value.province.trim(),
    city: value.city.trim(),
    address: value.address.trim(),
  })
}

export function formatInstitutionAddress(
  value: string | null | undefined,
): string {
  const address = parseInstitutionAddress(value)

  return [address.address, address.city, address.province]
    .filter(Boolean)
    .join(', ')
}
