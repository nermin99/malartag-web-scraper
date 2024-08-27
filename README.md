# Mälartåg Web Scraper

Delayed [Mälartåg](https://www.trafikverket.se/trafikinformation/tag?Station=Nykvarn&ArrDep=departure), gotta catch 'em all!

## Install

```sh
npm install
```

## AWS

1. Create IAM user. If lazy, the `AdministratorAccess` permission is sufficient.

2. Fill in IAM credentials in `.env` file.

```sh
cp .env.example .env
```

3. Download the [AWS CLI](https://aws.amazon.com/cli/).

4. Create a DynamoDB table. Replace `malartag-scraper-table` with your table name.

5. Create a Lambda function. Replace `malartag-scraper-function` with your function name.

### Lambda Function Configuration

1. Set Timeout to 10 seconds minimum.

1. Add environment variable `NODE_ENV`: `production`.

1. Add the following permission (role name): `AmazonDynamoDBFullAccess`.

## Run

```sh
npm start
```

## Deploy

Make sure you are logged in to AWS CLI.

```sh
npm run zip
```

```sh
npm run updateLambda
```

## Scheduling

Add AWS EventBridge trigger to your lambda function.

Schedule to run once every 24 hours at 03:00 UTC: `cron(0 3 * * ? *)`.

---

## Mälartåg Form Filler

See the [form-filler](./form-filler/README.md) directory for more information.
