import puppeteer from 'puppeteer'
import fs from 'node:fs'; import path from 'node:path'

/** The slider must never let you request more than your available credit. */
function findChrome() {
  const root = path.join(process.env.USERPROFILE || process.env.HOME || '', '.cache', 'puppeteer', 'chrome')
  const builds = fs
    .readdirSync(root)
    .map((d) => ({ d, v: Number((d.match(/win64-(\d+)/) || [])[1] || 0) }))
    .sort((a, b) => b.v - a.v)
  for (const x of builds) {
    const c = path.join(root, x.d, 'chrome-win64', 'chrome.exe')
    if (fs.existsSync(c)) return c
  }
}

const BASE = 'http://localhost:5174'
const browser = await puppeteer.launch({ headless: 'new', executablePath: findChrome(), args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 430, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const checks = []

// Seed, then read the real available credit.
await page.goto(BASE + '/app/home', { waitUntil: 'networkidle2' })
await page.click('button[aria-label="Open demo menu"]')
await new Promise((r) => setTimeout(r, 500))
await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Dashboard')?.click() })
await new Promise((r) => setTimeout(r, 900))
const available = await page.evaluate(() => JSON.parse(localStorage.getItem('creditflow-demo')).state.credit.available)
console.log('available credit:', available)

// Personal Loan publishes a ₹5,00,000 max — the slider must cap below that.
await page.goto(BASE + '/app/loans/apply/personal', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 900))
const slider = await page.$eval('input[type="range"]', (el) => ({ min: Number(el.min), max: Number(el.max), value: Number(el.value) }))
console.log('personal slider:', JSON.stringify(slider))
checks.push(['slider max == available credit', slider.max === available])
checks.push(['slider max below product maximum', slider.max < 500000])
checks.push(['starting value within limit', slider.value <= available])

// Drag to the far end and confirm the quote never exceeds the limit.
await page.$eval('input[type="range"]', (el) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, el.max)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
})
await new Promise((r) => setTimeout(r, 700))
const body = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
const requested = Number((body.match(/Loan amount ₹([\d,]+)/) || [])[1]?.replace(/,/g, '') || 0)
console.log('requested at max:', requested)
checks.push(['quote amount never exceeds available', requested > 0 && requested <= available])
checks.push(['cap is explained to the user', /Capped at your available credit/.test(body)])

console.log('\n--- assertions ---')
let failed = 0
for (const [l, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${l}`); if (!ok) failed++ }
if (errors.length) console.log('\nERRORS:', [...new Set(errors)].join('\n'))
await browser.close()
process.exit(failed || errors.length ? 1 : 0)
