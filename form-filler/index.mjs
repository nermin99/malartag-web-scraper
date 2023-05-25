import puppeteer from 'puppeteer'
import dotenv from 'dotenv'
dotenv.config()

// TODO: FILL IN TRAVEL INFORMATION
const DEPARTURE_STATION = 'Nykvarn'
const ARRIVAL_STATION = 'Stockholm C'
const TRAVEL_DATE = '2023-05-12'
const SCHEDULED_DEPARTURE_TIME = '23:36'

const URL = 'https://evf-regionsormland.preciocloudapp.net/trains'

const browser = await puppeteer.launch({ headless: true, slowMo: 20 })
// const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
const page = await browser.newPage()
await page.setViewport({ width: 800, height: 600 })

await page.goto(URL)
await page.screenshot({ path: '1.png' })

// 1. --------------------------------------------------------------------------
// Input ticket number
await page.type('div[data-index="0"] input', process.env.TICKET_NUMBER)
await page.screenshot({ path: '2.png' })

// Click continue
await page.click('div[data-index="0"] button.MuiButton-containedPrimary')
await page.screenshot({ path: '3.png' })

// 2. --------------------------------------------------------------------------
const fields = await page.$$('div[data-index="1"] input')

// Select departure station
await fields[0].type(DEPARTURE_STATION)
await page.click('li[data-option-index="0"]')
await page.screenshot({ path: '4.png' })

// Select arrival station
await fields[1].type(ARRIVAL_STATION)
await page.click('li[data-option-index="0"]')
await page.screenshot({ path: '5.png' })

// Select travel date
await fields[2].click()
const [, month, day] = TRAVEL_DATE.split('-').map(Number) // TODO: fix being able to select month
// const dates = await page.$$('.MuiPickersModal-dialogRoot div[role="presentation"] button')
await page.evaluate((day) => {
  const btns = [
    ...document.querySelectorAll('.MuiPickersModal-dialogRoot div[role="presentation"] button'),
  ]
  const btn = btns.find((btn) => btn.querySelector('p').textContent == day)
  btn.click()
}, day)
// const btn = dates.find((btn) => btn.$eval('p', (el) => el.textContent == day))
// await btn.click()
await page.screenshot({ path: '6.png' })

// Select scheduled departure time
await page.type('input[placeholder="HH:mm"]', SCHEDULED_DEPARTURE_TIME)
await page.screenshot({ path: '7.png' })

// Click continue
await page.click('div[data-index="1"] button.MuiButton-containedPrimary')
await page.screenshot({ path: '8.png' })

// 3. --------------------------------------------------------------------------
// Fill in personal information
const fields2 = await page.$$('div[data-index="2"] input')
await fields2[0].type(process.env.FIRST_NAME)
await fields2[1].type(process.env.LAST_NAME)
await fields2[2].type(process.env.ADDRESS)
await fields2[3].type(process.env.POSTAL_CODE)
await page.screenshot({ path: '9a.png' })
await fields2[4].type(process.env.CITY)
await fields2[5].type(process.env.SSN)
await fields2[6].type(process.env.PHONE)
await fields2[7].type(process.env.EMAIL)
await fields2[8].type(process.env.EMAIL) // confirm email
await page.screenshot({ path: '9b.png' })

// Click continue
await page.click('div[data-index="2"] button.MuiButton-containedPrimary')
await page.screenshot({ path: '10.png' })

// 4. --------------------------------------------------------------------------
// Check verify correct information box
await page.click('input[type="checkbox"]')
await page.screenshot({ path: '11.png' })

// Submit form
await page.click('div[data-index="3"] button.MuiButton-containedPrimary')
await sleep(1000)
await page.screenshot({ path: '12.png' })

await browser.close()
// -----------------------------------------------------------------------------

// Helper function
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
