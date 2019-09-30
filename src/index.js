/* @flow */

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import fs from 'fs';
import path from "path";
import https from 'https';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';

import config from './config';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
import schemaDirectives from './graphql/directives';
import { sequelize } from './models';
import mediaRouter from './route/media';
import logger from './middleware/logger';

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives,
  context: async ({ req, res }) => {
    return {
      authorization: req.headers.authorization,
      req,
      res
    };
  },
})

const app = express()
app.use(passport.initialize())
app.use(cors())
app.use('/public', express.static(path.join(__dirname, '../public')))
app.use('/public/media', mediaRouter)
app.use(helmet())

apollo.applyMiddleware({ app })

// Create the HTTPS or HTTP server, per configuration
var server
if (config.ssl) {
  // Assumes certificates are in .ssl folder from package root. Make sure the files are secured.
  server = https.createServer(
    {
      // key: fs.readFileSync(`./ssl/server.key`),
      // cert: fs.readFileSync(`./ssl/server.crt`)
    },
    app
  )
} else {
  server = http.createServer(app)
}

// Add subscription support
apollo.installSubscriptionHandlers(server)

sequelize.sync({force: false}).then(() => {
  logger.info('Connected to database')

  app.listen({ port: config.port }, () =>
    logger.info(
      `🚀 Server ready at: http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
    )
  )
})