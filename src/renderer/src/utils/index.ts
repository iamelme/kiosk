export function humanize(str): string {
  return str
    .replace(/^[\s_]+|[\s_]+$/g, '')
    .replace(/[-_\s]+/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^[a-z]/, function (m) {
      return m.toUpperCase()
    })
}

export const saleStatuses = [
  { label: 'In-progress', value: 'in-progress' },
  { label: 'Complete', value: 'complete' },
  { label: 'Void', value: 'void' }
]
