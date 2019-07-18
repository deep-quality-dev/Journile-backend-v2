/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Contact {
    id: ID!
    user: User!
    account: User!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getContacts: [Contact]!
    getUserContacts(user_id: ID!): [Contact]!
  }
`;