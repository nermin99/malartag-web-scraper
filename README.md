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

5. Create a DynamoDB table. Replace `malartag-scraper` with your table name.

## Run

```sh
npm start
```

## Deploy

```sh
npm run zip
```

Make sure you are logged in to AWS CLI.

```sh
npm run updateLambda
```
