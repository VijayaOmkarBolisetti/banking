import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Horizontal-overflow regression check.
 *
 * `.app-stage` and `.app-shell` both set `overflow: hidden`, so an element
 * that is wider than the viewport gets silently clipped — `scrollWidth` still
 * reports the viewport width and nothing looks broken in a smoke test. This
 * walks the tree and flags any node wider than its viewport instead.
 */

const BASE = process.env.BASE_URL || 'http://localhost:5174'

const ROUTES = [
  '/app/home',
  '/app/my-loans',
  '/app/payments',
  '/app/credit',
  '/app/profile',
  '/app/loans/apply',
  '/app/loans/apply/home',
  '/app/support',
  '/app/chat',
  '/app/transactions',
  '/app/repayment-schedule',
  '/onboarding',
  '/login',
]

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'phablet', width: 430, height: 932 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'laptop', width: 1440, height: 900 },
  { name: 'wide', width: 1920, height: 1080 },
]

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const root = path.join(process.env.USERPROFILE || process.env.HOME || '', '.cache', 'puppeteer', 'chrome')
  if (!fs.existsSync(root)) return undefined
  const builds = fs
    .readdirSync(root)
    .map((dir) => ({ dir, version: Number((dir.match(/win64-(\d+)/) || [])[1] || 0) }))
    .sort((a, b) => b.version - a.version)
  for (const build of builds) {
    for (const candidate of [
      path.join(root, build.dir, 'chrome-win64', 'chrome.exe'),
      path.join(root, build.dir, 'chrome-linux64', 'chrome'),
    ]) {
      if (fs.existsSync(candidate)) return candidate
    }
  }
  return undefined
}

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: findChrome(),
  args: ['--no-sandbox'],
})

const findings = []
const page = await browser.newPage()

// Seed once so authenticated screens have content to lay out.
await page.setViewport(VIEWPORTS[0])
await page.goto(`${BASE}/app/home`, { waitUntil: 'networkidle2' })
await page.click('button[aria-label="Open demo menu"]')
await new Promise((r) => setTimeout(r, 500))
await page.evaluate(() => {
  ;[...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Dashboard')?.click()
})
await new Promise((r) => setTimeout(r, 800))

for (const viewport of VIEWPORTS) {
  await page.setViewport(viewport)
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 30000 })
    await new Promise((r) => setTimeout(r, 500))

    const overflows = await page.evaluate((limit) => {
      const bad = []
      const walk = (el, depth) => {
        if (depth > 10) return
        const rect = el.getBoundingClientRect()
        // Ignore intentional scroll containers — they are meant to be wider.
        const style = getComputedStyle(el)
        const scrolls = style.overflowX === 'auto' || style.overflowX === 'scroll'
        if (!scrolls && (rect.width > limit + 1 || rect.left < -1)) {
          bad.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || '').toString().slice(0, 60),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
          })
          return // report the outermost offender only
        }
        ;[...el.children].forEach((child) => walk(child, depth + 1))
      }
      walk(document.getElementById('root'), 0)
      return bad
    }, viewport.width)

    for (const item of overflows) {
      findings.push(`${viewport.name.padEnd(8)} ${route.padEnd(26)} <${item.tag}> w=${item.width} left=${item.left} .${item.cls}`)
    }
    process.stdout.write(overflows.length ? 'x' : '.')
  }
}

await browser.close()
console.log('\n')

if (findings.length === 0) {
  console.log(`No horizontal overflow across ${VIEWPORTS.length} viewports x ${ROUTES.length} routes.`)
  process.exit(0)
}

console.log(`${findings.length} overflowing element(s):`)
findings.forEach((f) => console.log('  ' + f))
process.exit(1)
