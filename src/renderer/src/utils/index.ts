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
