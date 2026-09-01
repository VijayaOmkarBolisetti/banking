import puppeteer from 'puppeteer'
import fs from 'node:fs'; import path from 'node:path'

/** Verifies an admin rate edit reaches every customer-facing surface. */
function findChrome() {
  const root = path.join(process.env.USERPROFILE || process.env.HOME || '', '.cache', 'puppeteer', 'chrome')
  const builds = fs.readdirSync(root)
    .map((d) => ({ d, v: Number((d.match(/win64-(\d+)/) || [])[1] || 0) }))
    .sort((a, b) => b.v - a.v)
  for (const b of builds) {
    const c = path.join(root, b.d, 'chrome-win64', 'chrome.exe')
    if (fs.existsSync(c)) return c
  }
}

const BASE = 'http://localhost:5174'
const NEW_RATE = '6.9'
const browser = await puppeteer.launch({ headless: 'new', executablePath: findChrome(), args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

// Sign the admin in and change the Home Loan rate.
await page.goto(BASE + '/app/home', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 600))
await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle2' })
await page.evaluate(() => localStorage.setItem('creditflow-admin', JSON.stringify({
  state: { isAdminAuthenticated: true, adminEmail: 'admin@creditflow.app', operations: [] }, version: 0 })))
await page.goto(BASE + '/admin/settings', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 900))

const sel = 'input[aria-label="Home Loan interest rate"]'
const hasInput = await page.$(sel)
console.log(`rate input found = ${!!hasInput}`)
await page.click(sel)
await page.keyboard.down('Control')
await page.keyboard.press('KeyA')
await page.keyboard.up('Control')
await page.keyboard.press('Backspace')
await page.type(sel, NEW_RATE)
const typed = await page.$eval(sel, (el) => el.value)
console.log(`typed value in field = "${typed}"`)
const clickedSave = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent?.trim() === 'Save controls')
  if (!b) return false
  b.click()
  return true
})
console.log(`save clicked = ${clickedSave}`)
await new Promise((r) => setTimeout(r, 1400))
const raw = await page.evaluate(() => localStorage.getItem('creditflow-config'))
console.log(`config in storage = ${raw ? 'yes' : 'NULL'}`)
const stored = raw ? JSON.parse(raw).state.productRates.home : null
console.log(`admin saved home rate = ${stored}`)

// Now check every customer surface that shows a rate.
const checks = []
async function grab(name, url, matcher) {
  await page.goto(BASE + url, { waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 900))
  const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
  checks.push([name, matcher(text)])
}

// Seed the customer app once.
await page.goto(BASE + '/app/home', { waitUntil: 'networkidle2' })
await page.click('button[aria-label="Open demo menu"]')
await new Promise((r) => setTimeout(r, 500))
await page.evaluate(() => {
  ;[...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Dashboard')?.click()
})
await new Promise((r) => setTimeout(r, 900))

await grab('dashboard rail', '/app/home', (t) => t.includes(`from ${NEW_RATE}% p.a.`))
await grab('product catalogue', '/app/loans/apply', (t) => t.includes(`from ${NEW_RATE}% p.a.`))
await grab('apply screen', '/app/loans/apply/home', (t) => t.includes(`${NEW_RATE}% p.a.`))

// Chatbot
await page.goto(BASE + '/app/chat', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 800))
await page.type('input[aria-label="Message"]', 'what are your interest rates')
await page.click('button[aria-label="Send message"]')
await new Promise((r) => setTimeout(r, 2000))
const chat = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
checks.push(['chatbot rates', chat.includes(`Home Loan — from ${NEW_RATE}%`)])

console.log('\n--- rate propagation ---')
let failed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failed++
}
// This check mutates shared demo state, so put the rates back on defaults.
await page.goto(BASE + '/admin/settings', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 700))
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find(
    (x) => x.textContent?.trim() === 'Reset defaults',
  )
  b?.click()
})
await new Promise((r) => setTimeout(r, 800))
const restored = await page.evaluate(
  () => JSON.parse(localStorage.getItem('creditflow-config') || '{}')?.state?.productRates?.home,
)
console.log(`\nrestored home rate = ${restored}`)

if (errors.length) console.log('\nERRORS:', [...new Set(errors)].join('\n'))
await browser.close()
process.exit(failed || errors.length ? 1 : 0)
