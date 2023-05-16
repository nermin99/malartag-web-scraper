import AWS from 'aws-sdk'
import dotenv from 'dotenv'
dotenv.config()

if (process.env.NODE_ENV !== 'production') {
  AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  })
}

const dynamoClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = 'malartag-scraper-table'

const addOrUpdateTrain = async (train) => {
  const params = {
    TableName: TABLE_NAME,
    Item: train,
  }
  const res = await dynamoClient.put(params).promise()
  // console.log(res)
  return res
}

const STATION = 'Nkv' // Nkv | Cst

const locations = {
  Arb: 'Arboga',
  U: 'Uppsala C',
  Et: 'Eskilstuna C',
  Cst: 'Stockholm C',
  Öb: 'Örebro S',
}

const MINIMUM_DELAY = 20 // minutes

const getTimezoneOffset = (date) => date.getTimezoneOffset() / -60

// yyyy-MM-ddTHH:mm:ss+0X:00
const formatDate = (date) => date.toISOString().split('Z')[0] + `+0${getTimezoneOffset(date)}:00`

const offsetDate = (date, minutes) => new Date(date.getTime() + 60000 * minutes)

const localDate = (date) => new Date(offsetDate(date, getTimezoneOffset(date) * 60))

const now = new Date()
now.setHours(3, 0, 0, 0)
const yesterday = new Date(now)
yesterday.setDate(yesterday.getDate() - 1)

const URL = 'https://api.trafikinfo.trafikverket.se/v2/data.json'
const options = {
  method: 'POST',
  'content-type': 'text/plain',
}
options.body = `
<REQUEST>
    <LOGIN authenticationkey="707695ca4c704c93a80ebf62cf9af7b5" />
    <QUERY lastmodified="true" orderby="AdvertisedTimeAtLocation,EstimatedTimeAtLocation" objecttype="TrainAnnouncement" schemaversion="1.6" includedeletedobjects="false" sseurl="true">
        <FILTER>
            <AND>
                <EQ name="LocationSignature" value="${STATION}" />
                <EQ name="Advertised" value="true" />
                <EQ name="ActivityType" value="Avgang" />
                <GT name="AdvertisedTimeAtLocation" value="${formatDate(localDate(yesterday))}"/>
            </AND>
        </FILTER>
    </QUERY>
</REQUEST>
`

const reDate = /\d{4}-\d{2}-\d{2}/
const reTime = /\d{2}:\d{2}/

export const handler = async (event) => {
  const response = await fetch(URL, options)
  const responseBody = await response.text().then((text) => JSON.parse(text))

  const trains = responseBody?.RESPONSE?.RESULT[0]?.TrainAnnouncement
  // console.dir(trains[0], { depth: null })

  const results = []
  for (const train of trains) {
    const { AdvertisedTrainIdent, AdvertisedTimeAtLocation, TimeAtLocation } = train

    const obj = {
      date: AdvertisedTimeAtLocation.match(reDate)[0],
      time: AdvertisedTimeAtLocation.match(reTime)[0],
      location: locations[train.ToLocation[0].LocationName],
      AdvertisedTrainIdent,
      // FromLocation: train.FromLocation[0].LocationName,
      ToLocation: train.ToLocation[0].LocationName,
      cancelled: false,
      AdvertisedTimeAtLocation,
    }

    // Check if train is cancelled
    if (train?.Deviation?.[0]?.Description === 'Inställt') {
      obj.cancelled = true
      results.push(obj)
      continue
    }

    // Check if train is delayed
    if (TimeAtLocation) {
      obj.TimeAtLocation = TimeAtLocation
      const delay = Math.floor(
        (new Date(TimeAtLocation).getTime() - new Date(AdvertisedTimeAtLocation).getTime()) / 60000
      )
      if (delay >= MINIMUM_DELAY) {
        obj.delay = delay
        results.push(obj)
      }
    }
  }

  // console.log(results)

  for (const result of results) {
    result.id = `${result.date}_${result.time}_${result.location}`
    await addOrUpdateTrain(result) // await necessary when running in aws
  }

  return {
    statusCode: 200,
    body: results,
  }
}

// console.log(await handler()) // TODO: REMOVE ME IN AWS
