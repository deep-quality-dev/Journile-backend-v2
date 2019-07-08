/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Language {
    id: ID!
    name: String!
    native_name: String!
    code: String!
    code2: String!
    code3: String!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getLanguages: [Language]!
    getLanguage(id: ID!): Language!
    getLanguageByCode(code: String!): Language!
  }
`;