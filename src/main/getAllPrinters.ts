import { BrowserWindow } from 'electron'

export default async function getAllPrinters(): Promise<void> {
  const printWindow = new BrowserWindow({ show: false })

  try {
    const availablePrinters = await printWindow.webContents.getPrintersAsync()
    console.log('All available printers are:', availablePrinters)

    // You can then use this list to find a specific printer by name
    // const preferredPrinterName = 'Your_Printer_Name';
    // const selectedPrinter = availablePrinters.find(printer => printer.name === preferredPrinterName);
  } catch (error) {
    console.error('Error fetching printers:', error)
  } finally {
    // Close the window after getting the printers
    printWindow.close()
  }
}
