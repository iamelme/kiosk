import { app } from 'electron'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

import { imageSize } from 'image-size'

import { ReturnSaleType } from '../renderer/src/utils/types'
import { join } from 'path'
import fs from 'fs'

export default function createPDF(params: ReturnSaleType & { logo: string }): ArrayBuffer {
  const {
    logo,
    created_at,
    invoice_number,
    status,
    customer_name,
    items,
    sub_total,
    discount,
    total,
    amount,
    method
  } = params

  const doc = new jsPDF()
  const userDataPath = app.getPath('userData')
  const imgUrl = join(userDataPath, 'assets/images/logo.webp')

  doc.allowFsRead = [
    './fonts/*',
    'assets/images/logo.webp',
    './assets/images/logo.webp',
    imgUrl,
    join(userDataPath, '/kiosk-app/assets/images/logo.webp')
  ]

  const pageSize = doc.internal.pageSize

  const imageData = fs.readFileSync(logo)

  const dimensions = imageSize(imageData)
  const imgWidth = dimensions.width
  const imgHeight = dimensions.height

  const maxWidth = 50
  const maxHeight = 25

  let aspectRatio = 1
  let imgW = imgWidth
  let imgH = imgHeight

  if (imgWidth > maxWidth) {
    aspectRatio = maxWidth / imgWidth
    imgW = maxWidth
    imgH = imgHeight * aspectRatio
  }

  if (imgHeight > maxHeight) {
    aspectRatio = maxHeight / imgHeight
    imgW = imgWidth * aspectRatio
    imgH = maxHeight
  }

  const base64Image = Buffer.from(imageData).toString('base64')

  const mimeType = 'image/webp'
  const dataUri = `data:${mimeType};base64,${base64Image}`

  doc.addImage(dataUri, 'WEBP', 15, 10, imgW, imgH)

  doc.text('Invoice No.', pageSize.width - 15, 10, { align: 'right' })
  doc.text(String(invoice_number), pageSize.width - 15, 20, { align: 'right' })
  doc.setFontSize(10)
  doc.text(String(new Date(created_at).toLocaleString()), pageSize.width - 15, 25, {
    align: 'right'
  })
  doc.text(`${status[0].toUpperCase()}${status.slice(1)}`, pageSize.width - 15, 30, {
    align: 'right'
  })

  doc.setFont('Helvetica', 'bold')
  doc.text('Bill To', 15, 50)
  doc.setFont('Helvetica', 'normal')
  doc.text(customer_name ?? '', 15, 55)

  const tHeaders = ['Name', 'Quantity', 'Unit Price', 'Total']
  // console.log('items', items)
  // console.log('items[0]', items[0]?.name)

  const tData = items.map((item) => [
    item.name,
    String(item.quantity),
    String(item.unit_price / 100),
    String(item.line_total / 100)
  ])

  autoTable(doc, {
    styles: {
      halign: 'right',
      lineWidth: 0
    },
    didParseCell: function (data) {
      console.log('data', data.column)

      if (data.section === 'head' && data.column.dataKey === 0) {
        data.cell.styles.halign = 'left'
      }
    },
    columnStyles: {
      0: {
        halign: 'left'
      }
    },
    head: [tHeaders],
    body: tData,
    foot: [
      ['', '', 'Sub Total:', sub_total / 100],
      ['', '', 'Discount:', `(${discount / 100})`],
      ['', '', 'Total:', total / 100],
      ['', '', 'Paid Amount:', amount / 100],
      ['', '', 'Change Due:', (total - amount) / 100]
    ],
    footStyles: {
      fillColor: false,
      textColor: [0, 0, 0],
      halign: 'right',
      lineColor: false
    },
    startY: 60,
    showHead: 'firstPage'
  })

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  doc.text(
    `Payment Method: ${method[0].toUpperCase()}${method.slice(1)}`,
    pageSize.width - 15,
    finalY,
    {
      align: 'right'
    }
  )

  const signatureText = 'Signature:'
  const textX = 15
  const textY = finalY

  doc.text(signatureText, textX, textY)

  const textWidth =
    (doc.getStringUnitWidth(signatureText) * doc.getFontSize()) / doc.internal.scaleFactor

  const lineStartX = textX + textWidth + 2
  const lineEndX = lineStartX + 30
  const lineY = textY + doc.getFontSize() * 0.35
  doc.setLineWidth(0.5)
  doc.setDrawColor(0, 0, 0) // Black color

  doc.line(lineStartX, lineY, lineEndX, lineY)

  const blob = doc.output('arraybuffer')

  return blob
}
