import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:5174'

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const root = path.join(process.env.USERPROFILE || process.env.HOME || '', '.cache', 'puppeteer', 'chrome')
  if (!fs.existsSync(root)) return undefined
  const builds = fs
    .readdirSync(root)
    .map((dir) => ({ dir, version: Number((dir.match(/win64-(\d+)/) || [])[1] || 0) }))
    .sort((a, b) => b.version - a.version)
  for (const build of builds) {
    const candidate = path.join(root, build.dir, 'chrome-win64', 'chrome.exe')
    if (fs.existsSync(candidate)) return candidate
  }
  return undefined
}

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: findChrome(),
  args: ['--no-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844 })

const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

const readState = () =>
  page.evaluate(() => {
    const parsed = JSON.parse(localStorage.getItem('creditflow-demo')).state
    const loan = parsed.loans[0]
    return {
      used: parsed.credit.used,
      available: parsed.credit.available,
      limit: parsed.credit.limit,
      paid: loan.emis.filter((e) => e.status === 'paid').length,
      tenure: loan.tenure,
      closed: loan.closed,
      amount: loan.amount,
      txns: parsed.transactions.length,
      coins: parsed.coins,
    }
  })

// Seed through the app's own demo menu.
await page.goto(BASE + '/app/home', { waitUntil: 'networkidle2' })
await page.click('button[aria-label="Open demo menu"]')
await new Promise((r) => setTimeout(r, 500))
await page.evaluate(() => {
  ;[...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Dashboard')?.click()
})
await new Promise((r) => setTimeout(r, 900))

const before = await readState()
console.log('before payment:', before)

// Pay one EMI end to end.
await page.goto(BASE + '/app/pay-now', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 700))
await page.evaluate(() => {
  ;[...document.querySelectorAll('button')].find((b) => b.textContent?.startsWith('Pay ₹'))?.click()
})
await new Promise((r) => setTimeout(r, 3200))

const bodyText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 200))
console.log('after screen :', bodyText)

const after = await readState()
console.log('after payment :', after)

const perEmiPrincipal = Math.round(before.amount / before.tenure)
const releasedActual = before.used - after.used
const checks = [
  ['EMI marked paid', after.paid === before.paid + 1],
  ['transaction recorded', after.txns === before.txns + 1],
  [`principal released (~${perEmiPrincipal})`, releasedActual === perEmiPrincipal],
  ['available went up', after.available > before.available],
  ['limit unchanged', after.limit === before.limit],
  ['used + available == limit', after.used + after.available === after.limit],
  ['coins awarded for the EMI', after.coins > before.coins],
]

console.log('\n--- assertions ---')
let failed = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
  if (!ok) failed += 1
}
console.log(`\nreleased ${releasedActual} on a ${before.amount} / ${before.tenure}m loan`)
if (errors.length) console.log('\nERRORS:', [...new Set(errors)].join('\n'))

await browser.close()
process.exit(failed || errors.length ? 1 : 0)
