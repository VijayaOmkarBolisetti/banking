import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const htmlPath = path.join(root, 'public', 'feasibility-report.html')
const pdfPath = path.join(root, 'public', 'CreditFlow-Feasibility-Report.pdf')

const puppeteer = await import('puppeteer')
const browser = await puppeteer.default.launch({ headless: true })
const page = await browser.newPage()
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' })
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
})
await browser.close()
console.log(`PDF written to ${pdfPath}`)
