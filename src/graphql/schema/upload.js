/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type File {
    url: String!
    thumbUrl: String,
    filename: String!
    mimetype: String!
    encoding: String!
  }

  extend type Mutation {
    upload(file: Upload!): File!
  }
`;