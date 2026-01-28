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

export function addDays(date: Date, days: number): string {
  if (!date) {
    return ''
  }
  const newDate = new Date(date)

  newDate.setDate(date.getDate() + days)
  return newDate.toISOString()
}

export function csvDownload<T>({
  header,
  data,
  title
}: {
  header: Array<string>
  data: T
  title: string
}): void {
  const content = Array.isArray(data)
    ? data?.map((d) => Object.values(d).join(', ')).join('\n')
    : ''
  const csvString = `${header}\n` + content
  const uri = encodeURI('data:text/csv;charset=utf-8,' + csvString)

  const link = document.createElement('a')
  link.setAttribute('href', uri)
  link.setAttribute('download', `${title}.csv`)
  document.body.appendChild(link)

  link.click()
  document.body.removeChild(link)
}
