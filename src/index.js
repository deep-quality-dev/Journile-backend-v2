/* @flow */

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import fs from 'fs';
import https from 'https';
import http from 'http';
import passport from 'passport';

import config from './config';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
import { sequelize } from './models';

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, res }) => {
    return {
      authorization: req.headers.Authorization
    };
  },
})

const app = express()
app.use(passport.initialize())

apollo.applyMiddleware({ app })

// Create the HTTPS or HTTP server, per configuration
var server
if (config.ssl) {
  // Assumes certificates are in .ssl folder from package root. Make sure the files are secured.
  server = https.createServer(
    {
      key: fs.readFileSync(`./ssl/server.key`),
      cert: fs.readFileSync(`./ssl/server.crt`)
    },
    app
  )
} else {
  server = http.createServer(app)
}

// Add subscription support
apollo.installSubscriptionHandlers(server)

sequelize.sync({force: false}).then(() => {
  console.log('Connected to database')

  server.listen({ port: config.port }, () =>
    console.log(
      '🚀 Server ready at',
      `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
    )
  )
})