# Journile v2 Back-end Server
Journile is a smart new social media platform in the world - Say GoodBye To FakeNews!


## Features

- Express
- PostgreSQL
- Sequelize
- GraphQL
- Redis
- Babel 7

## Requirements
- [NodeJS v8 or higher](https://nodejs.org/en/)
- [PostgreSQL v9 or higher](https://www.postgresql.org/)
- [Redis v5 or higher](https://redis.io/)
- [pm2](http://pm2.keymetrics.io/) for production version

## Installation

- Install all the node packages listed in the package.json
  `npm install`
- Replace **.env.example** to **.env** and complete PostgreSQL database and redis server connection details
- Prepare database (create tables and populate)

## Run the node server
###Development###
- Run node server
`npm start`
- Browse graphql schema to **http://localhost:4000/graphql**

###Production###
- Pack and minimize source codes
`npm build`
- Run node server as daemon
`pm2 start build/index.js`
