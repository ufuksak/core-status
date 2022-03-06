export function isEmpty (value?: string | null): boolean {
  if (value === undefined || value === null) {
    return true
  }

  return value.length <= 0
}
