import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })

await page.goto('https://www.lieferando.de/speisekarte/la-mila', {
  waitUntil: 'networkidle2',
  timeout: 30000,
})

await new Promise(r => setTimeout(r, 3000))

// Try clicking cookie consent if present
try {
  await page.click('[data-qa="accept-all-cookies"], #onetrust-accept-btn-handler, .cookie-accept, [class*="accept"]')
  await new Promise(r => setTimeout(r, 1000))
} catch {}

await page.screenshot({ path: 'ss1.png' })

// Scroll down
for (let i = 1; i <= 10; i++) {
  await page.evaluate((s) => window.scrollTo(0, s * 600), i)
  await new Promise(r => setTimeout(r, 300))
}
await page.screenshot({ path: 'ss2.png' })

const itemCount = await page.evaluate(() => document.querySelectorAll('[data-qa="item"]').length)
const liCount   = await page.evaluate(() => document.querySelectorAll('li[class*="list-item"]').length)
console.log('items:', itemCount, 'li:', liCount)

await browser.close()