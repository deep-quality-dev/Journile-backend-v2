/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type File {
    url: String! @URL
    thumbUrl: String, @URL
    filename: String!
    mimetype: String!
    encoding: String!
  }

  extend type Mutation {
    upload(file: Upload!): File!
  }
`;