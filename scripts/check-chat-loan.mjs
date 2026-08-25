import puppeteer from 'puppeteer'
import fs from 'node:fs'; import path from 'node:path'

/** Verifies the CIBIL-driven limit and the in-chat Instant Loan journey. */
function findChrome() {
  const root = path.join(process.env.USERPROFILE || process.env.HOME || '', '.cache', 'puppeteer', 'chrome')
  const builds = fs.readdirSync(root)
    .map((d) => ({ d, v: Number((d.match(/win64-(\d+)/) || [])[1] || 0) })).sort((a, b) => b.v - a.v)
  for (const b of builds) {
    const c = path.join(root, b.d, 'chrome-win64', 'chrome.exe')
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

const readState = () => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('creditflow-demo') || '{}').state || {}
  return { limit: s.credit?.limit, available: s.credit?.available, score: s.creditScore?.score, loans: (s.loans || []).length, coins: s.coins }
})

// 1. A brand-new user starts on the entry limit, not ₹5L.
await page.goto(BASE + '/app/home', { waitUntil: 'networkidle2' })
await page.evaluate(() => localStorage.removeItem('creditflow-demo'))
await page.goto(BASE + '/app/home', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 900))
const fresh = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
checks.push(['fresh user sees ₹25,000 limit', fresh.includes('₹25,000')])
console.log('fresh dashboard limit text:', (fresh.match(/PRE-APPROVED LIMIT ([^ ]+)/) || [])[1])

// 2. Demo user's limit comes from their band, not a flat figure.
await page.click('button[aria-label="Open demo menu"]')
await new Promise((r) => setTimeout(r, 500))
await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Dashboard')?.click() })
await new Promise((r) => setTimeout(r, 900))
const seeded = await readState()
console.log('seeded:', JSON.stringify(seeded))
checks.push(['seeded score is a real CIBIL number', seeded.score >= 300 && seeded.score <= 900])
checks.push(['seeded limit matches a band, not ₹5L default', seeded.limit !== 500000 && seeded.limit > 25000])

// 3. Apply for an Instant Loan entirely inside the chat.
await page.goto(BASE + '/app/chat', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 800))
await page.type('input[aria-label="Message"]', 'i need money now')
await page.click('button[aria-label="Send message"]')
await new Promise((r) => setTimeout(r, 2200))

async function tapChip(match) {
  return page.evaluate((m) => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent?.trim().includes(m))
    if (!b) return false
    b.click()
    return true
  }, match)
}

const chips = await page.$$eval('button', (els) => els.map((e) => e.textContent?.trim()).filter(Boolean))
console.log('buttons on screen:', JSON.stringify(chips))
const botText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 400))
console.log('transcript:', botText)
checks.push(['chat offers in-chat apply', await tapChip('Apply right here')])
await new Promise((r) => setTimeout(r, 2000))
checks.push(['chat offers amount options', await tapChip('₹25,000')])
await new Promise((r) => setTimeout(r, 2000))
const quoted = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
checks.push(['chat shows a quote with EMI', /Monthly EMI/.test(quoted)])
checks.push(['chat offers confirm', await tapChip('Confirm')])
await new Promise((r) => setTimeout(r, 4000))

const after = await readState()
const transcript = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
console.log('after:', JSON.stringify(after))
checks.push(['loan actually created from chat', after.loans === seeded.loans + 1])
checks.push(['coins awarded for chat disbursal', after.coins > seeded.coins])
checks.push(['chat confirms disbursal', /on its way to your linked account/.test(transcript)])

await page.screenshot({ path: path.join(process.argv[2] || '.', 'chat-instant-loan.png') })

console.log('\n--- assertions ---')
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`); if (!ok) failed++ }
if (errors.length) console.log('\nERRORS:', [...new Set(errors)].join('\n'))
await browser.close()
process.exit(failed || errors.length ? 1 : 0)
