/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type UserSetting {
    id: ID!
    user: User!
    paypal_address: String
    show_balance_in_wallet: Boolean!
    reader_tag_photo: Boolean!
    all_tag_photo: Boolean!
    personalization: Boolean!
    personalization_ads: Boolean!
    personalization_deivice: Boolean!
    personalization_location: Boolean!
    personalization_track: Boolean!
    personalisation_share_partner: Boolean!
    language: String!
    monetize_content: Boolean!
    find_by_email: Boolean!
    find_by_phonenumber: Boolean!
    content_only_pro: Boolean!
    famliy_safe: Boolean!
    theme: String!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getUserSetting: UserSetting! @isAuth
    getUserSettingByUserId(user_id: ID!): UserSetting! @isAuth
  }
`;