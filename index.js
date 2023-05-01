const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const AWS = require('aws-sdk')
require('dotenv').config()

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const dynamoClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = 'malartag-scraper'

// const getCharacters = async () => {
//   const params = {
//     TableName: TABLE_NAME,
//   }
//   const characters = await dynamoClient.scan(params).promise()
//   console.log(characters)
//   return characters
// }

// getCharacterById = async (id) => {
//   const params = {
//     TableName: TABLE_NAME,
//     Key: {
//       id,
//     },
//   }
//   result = await dynamoClient.get(params).promise()
//   console.log(result)
//   return result
// }

// const addOrUpdateCharacter = async (character) => {
//   const params = {
//     TableName: TABLE_NAME,
//     Item: character,
//   }
//   const result = await dynamoClient.put(params).promise()
//   console.log(result)
//   return result
// }
// const hp = {
//   id: '0',
//   name: 'Harry Potter',
//   house: 'Gryffindor',
// }

// const SITE_URL =
//   'https://www.trafikverket.se/trafikinformation/tag/?Station=Stockholm%20C&ArrDep=departure'

const SITE_URL =
  'https://www.trafikverket.se/trafikinformation/tag?Station=Nykvarn&ArrDep=departure'

const start = async () => {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()

  await page.goto(SITE_URL, { waitUntil: 'networkidle2' })

  await page.setViewport({ width: 1080, height: 1024 })

  const html = await page.content()
  const $ = cheerio.load(html)
  // .time-strikethrough
  // .time-advertised-time .time-strikethrough
  const $trs = $('tr td .time-strikethrough').parent().parent()

  const results = []
  for (const tr of $trs) {
    results.push({
      time: $(tr).find('.time-strikethrough').text(),
      estimatedTime: $(tr).find('.format-estimated-time').text(),
      cancelled: $(tr).find('.cancelled').length > 0,
      stationName: $(tr).find('.station-name').text(),
      trainNr: $(tr).find('.train').text(),
    })
  }

  console.log(results)

  browser.close()
}

start()
