/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Sequelize from 'sequelize';
import _ from 'lodash';

import models from '../../models';
import graph from '../../middleware/graph';

async function getUsers(user: any, userIds: Array<number>) {
  const option = {
    subQuery: false,
    nest: true,
    raw: true,
    attributes: {
      include: [
        [ user? Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('myRead.status')), 0): Sequelize.literal(0), 'reading' ],
        [ Sequelize.literal(0), 'type' ],
      ],
    },
    include: [{ model: models.Country, as: 'country' }],
    group: [ 'user.id', 'country.id' ],
    where: { '$user.id$': userIds },
  }

  if (user) {
    option.include.push({ model: models.Read, as: 'myRead', attributes: [], required: false, where: { user_id: user.id, type: 0 } });
  }

  return await models.User.findAll(option);
}

async function getChannels(user: any, channelIds: Array<number>) {
  const option = {
    subQuery: false,
    nest: true,
    raw: true,
    attributes: {
      include: [
        [ user? Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('myRead.status')), 0): Sequelize.literal(0), 'reading' ],
        [ Sequelize.literal(1), 'type' ],
        [ Sequelize.literal(0), 'level' ],
      ]
    },
    group: [ 'channel.id', 'country.id' ],
    include: [{ model: models.Country, as: 'country' }],
    where: { '$channel.id$': channelIds },
  }

  if (user) {
    option.include.push({ model: models.Read, as: 'myRead', attributes: [], required: false, where: { user_id: user.id, type: 1 } });
  }

  return await models.Channel.findAll(option);
}

export default {
  Query: {
    searchUsers: async (parent: any, params: any, context: any, info: any) => {
      const { searchkey, offset } = params
      const { user } = context
  
      const profileIds = graph.findUsers(user? user.id: -1, searchkey, offset);
      const userIds = _.filter(profileIds, { 'type': 'user' }).map(user => user.id);
      const channelIds = _.filter(profileIds, { 'type': 'channel' }).map(channel => channel.id);

      const users = await getUsers(user, userIds);
      const channels = await getChannels(user, channelIds);
      
      const profiles = _.sortBy(_.concat(users, channels), function(profile){
        return _.indexOf(profileIds, {id: profile.id, type: profile.type === 0? 'user': 'channel'});
      });

      return profiles;
    },
  },
};