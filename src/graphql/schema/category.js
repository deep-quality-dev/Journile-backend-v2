/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Category {
    id: ID!
    name: String!
    tags: String!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getCategories: [Category]!
    getCategory(id: ID!): Category!
  }
`;