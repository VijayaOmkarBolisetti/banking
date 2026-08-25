import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:5174'
const OUT = process.argv[2] || '.'
fs.mkdirSync(OUT, { recursive: true })

const VIEWPORTS = {
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { width: 834, height: 1112, deviceScaleFactor: 2 },
  laptop: { width: 1440, height: 900, deviceScaleFactor: 1 },
}

const PAGES = [
  { name: 'dashboard', url: '/app/home', seed: true },
  { name: 'products', url: '/app/loans/apply', seed: true },
  { name: 'apply-home', url: '/app/loans/apply/home', seed: true },
  { name: 'my-loans', url: '/app/my-loans', seed: true },
  { name: 'payments', url: '/app/payments', seed: true },
  { name: 'rewards', url: '/app/rewards', seed: true },
  { name: 'support', url: '/app/support', seed: true },
  { name: 'chat', url: '/app/chat', seed: true },
  { name: 'onboarding', url: '/onboarding', seed: false },
]

const errors = []

/** Use whichever Chrome the puppeteer cache already has, newest first. */
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const root = path.join(process.env.USERPROFILE || process.env.HOME || '', '.cache', 'puppeteer', 'chrome')
  if (!fs.existsSync(root)) return undefined
  const builds = fs
    .readdirSync(root)
    .map((dir) => ({
      dir,
      version: Number((dir.match(/win64-(\d+)/) || dir.match(/-(\d+)\./) || [])[1] || 0),
    }))
    .sort((a, b) => b.version - a.version)

  for (const build of builds) {
    for (const candidate of [
      path.join(root, build.dir, 'chrome-win64', 'chrome.exe'),
      path.join(root, build.dir, 'chrome-linux64', 'chrome'),
      path.join(root, build.dir, 'chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
    ]) {
      if (fs.existsSync(candidate)) return candidate
    }
  }
  return undefined
}

const executablePath = findChrome()
console.log(`chrome: ${executablePath ?? 'puppeteer default'}\n`)

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

async function newPage(viewport) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`)
  })
  page.on('requestfailed', (req) =>
    errors.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`),
  )
  return page
}

/**
 * Seed via the app's own demo menu so the fixture always matches whatever
 * `presentationSeed()` produces, rather than a hand-rolled copy that rots.
 */
async function seed(page) {
  await page.goto(BASE + '/app/home', { waitUntil: 'networkidle2', timeout: 30000 })
  await page.click('button[aria-label="Open demo menu"]')
  await new Promise((r) => setTimeout(r, 500))
  const clicked = await page.evaluate(() => {
    const target = [...document.querySelectorAll('button')].find(
      (b) => b.textContent?.trim() === 'Dashboard',
    )
    if (!target) return false
    target.click()
    return true
  })
  if (!clicked) throw new Error('demo menu: Dashboard entry not found')
  await new Promise((r) => setTimeout(r, 900))
}

for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  for (const spec of PAGES) {
    // laptop + mobile cover the matrix; tablet only for a couple of key screens
    if (vpName === 'tablet' && !['dashboard', 'products'].includes(spec.name)) continue

    const page = await newPage(viewport)
    try {
      await page.goto(BASE + spec.url, { waitUntil: 'networkidle2', timeout: 30000 })
      if (spec.seed) {
        await seed(page)
        await page.goto(BASE + spec.url, { waitUntil: 'networkidle2', timeout: 30000 })
      }
      await new Promise((r) => setTimeout(r, 1200))

      const text = await page.evaluate(() => document.body.innerText.slice(0, 200))
      const nodes = await page.evaluate(() => document.querySelectorAll('#root *').length)
      console.log(`${vpName.padEnd(7)} ${spec.name.padEnd(12)} nodes=${String(nodes).padEnd(5)} "${text.replace(/\s+/g, ' ').slice(0, 60)}"`)

      if (nodes < 10) errors.push(`[blank] ${vpName}/${spec.name} rendered only ${nodes} nodes`)

      await page.screenshot({ path: path.join(OUT, `${vpName}-${spec.name}.png`), fullPage: false })
    } catch (err) {
      errors.push(`[nav] ${vpName}/${spec.name}: ${err.message}`)
    }
    await page.close()
  }
}

// Admin console
{
  const page = await newPage(VIEWPORTS.laptop)
  try {
    await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle2', timeout: 30000 })
    await new Promise((r) => setTimeout(r, 800))
    await page.screenshot({ path: path.join(OUT, 'laptop-admin-login.png') })

    await page.evaluate(() => {
      localStorage.setItem(
        'creditflow-admin',
        JSON.stringify({
          state: { isAdminAuthenticated: true, adminEmail: 'admin@creditflow.app', operations: [] },
          version: 0,
        }),
      )
    })
    for (const [name, url] of [
      ['admin-overview', '/admin'],
      ['admin-settings', '/admin/settings'],
      ['admin-loans', '/admin/loans'],
      ['admin-support', '/admin/support'],
      ['admin-appearance', '/admin/appearance'],
    ]) {
      await page.goto(BASE + url, { waitUntil: 'networkidle2', timeout: 30000 })
      await new Promise((r) => setTimeout(r, 900))
      const nodes = await page.evaluate(() => document.querySelectorAll('#root *').length)
      console.log(`laptop  ${name.padEnd(12)} nodes=${nodes}`)
      if (nodes < 10) errors.push(`[blank] ${name} rendered only ${nodes} nodes`)
      await page.screenshot({ path: path.join(OUT, `laptop-${name}.png`) })
    }
  } catch (err) {
    errors.push(`[admin] ${err.message}`)
  }
  await page.close()
}

// Dark theme pass — same screens, opposite palette.
{
  for (const [vpName, viewport] of [
    ['mobile', VIEWPORTS.mobile],
    ['laptop', VIEWPORTS.laptop],
  ]) {
    const page = await newPage(viewport)
    try {
      await page.goto(BASE + '/app/home', { waitUntil: 'networkidle2' })
      await page.evaluate(() => {
        localStorage.setItem(
          'creditflow-theme',
          JSON.stringify({ state: { mode: 'dark', accent: '#3b5bdb' }, version: 0 }),
        )
      })
      await seed(page)

      for (const spec of [
        { name: 'dark-dashboard', url: '/app/home' },
        { name: 'dark-products', url: '/app/loans/apply' },
        { name: 'dark-apply-instant', url: '/app/loans/apply/instant' },
        { name: 'dark-rewards', url: '/app/rewards' },
        { name: 'dark-chat', url: '/app/chat' },
        { name: 'dark-appearance', url: '/app/profile/appearance' },
        { name: 'dark-onboarding', url: '/onboarding' },
      ]) {
        await page.goto(BASE + spec.url, { waitUntil: 'networkidle2' })
        await new Promise((r) => setTimeout(r, 900))

        // The theme must actually be dark, not just requested.
        const bg = await page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue('--c-surface').trim(),
        )
        const nodes = await page.evaluate(() => document.querySelectorAll('#root *').length)
        console.log(`${vpName.padEnd(7)} ${spec.name.padEnd(20)} nodes=${String(nodes).padEnd(5)} --c-surface=${bg}`)
        if (!bg.startsWith('#0b')) errors.push(`[theme] ${spec.name} did not apply dark surface (got ${bg})`)
        if (nodes < 10) errors.push(`[blank] ${vpName}/${spec.name} rendered ${nodes} nodes`)

        await page.screenshot({ path: path.join(OUT, `${vpName}-${spec.name}.png`) })
      }
    } catch (err) {
      errors.push(`[dark] ${vpName}: ${err.message}`)
    }
    await page.close()
  }
}

// Chatbot interaction
{
  const page = await newPage(VIEWPORTS.mobile)
  try {
    await seed(page)

    for (const question of ['when is my emi due', 'tell me about home loans', 'emi for 5 lakh over 24 months']) {
      await page.goto(BASE + '/app/chat', { waitUntil: 'networkidle2' })
      await new Promise((r) => setTimeout(r, 700))
      await page.type('input[aria-label="Message"]', question)
      await page.click('button[aria-label="Send message"]')
      await new Promise((r) => setTimeout(r, 1900))

      const bubbles = await page.evaluate(() =>
        [...document.querySelectorAll('p')].map((p) => p.innerText).filter(Boolean),
      )
      console.log(`\n--- Q: ${question}`)
      console.log(bubbles.slice(-1)[0]?.slice(0, 260))
    }
    await page.screenshot({ path: path.join(OUT, 'mobile-chat-reply.png') })
  } catch (err) {
    errors.push(`[chat] ${err.message}`)
  }
  await page.close()
}

await browser.close()

console.log('\n================ ERRORS ================')
if (errors.length === 0) {
  console.log('none')
} else {
  const unique = [...new Set(errors)]
  unique.forEach((e) => console.log(e))
}
process.exit(errors.length ? 1 : 0)
