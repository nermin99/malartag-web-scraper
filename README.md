# Mälartåg Scraper

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

4. Create a lambda function. Replace `malartag-scraper` with your function name.

5. Create a DynamoDB table. Replace `malartag-scraper-function` with your table name.

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
