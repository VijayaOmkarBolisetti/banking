import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const htmlPath = path.join(root, 'public', 'client-pitch-report.html')
const pdfPath = path.join(root, 'public', 'CreditFlow-Client-Pitch.pdf')

async function main() {
  let puppeteer
  try {
    puppeteer = await import('puppeteer')
  } catch {
    const require = createRequire(import.meta.url)
    const { execSync } = await import('node:child_process')
    execSync('npm install puppeteer --no-save', { cwd: root, stdio: 'inherit' })
    puppeteer = await import('puppeteer')
  }

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
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
