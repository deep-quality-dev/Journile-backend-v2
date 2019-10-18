/* @flow */

import ug from 'ug';
import Sequelize from 'sequelize';
import _ from 'lodash';

import models from '../../models';
import logger from '../logger';

const Op = Sequelize.Op;

const Distants = {
  Root: 1,
  Read: 1,
  Issue: 1,
  Like: 2,
  Comment: 2,
  Tag: 3,
}

class GraphManager {
  g: any;
  rootNode: any;
  users: any;
  channels: any;
  reads: any;
  gammatags: any;
  posts: any;
  issues: any;
  likes: any;
  comments: any;
  tags: any;

  constructor() {
    this.g = new ug.Graph();
    this.rootNode = this.g.createNode('root', {name: 'Root Node'});
    this.users = {};
    this.channels = {};
    this.reads = {user: {}, channel: {}};
    this.gammatags = {};
    this.posts = {};
    this.issues = {user: {}, channel: {}};
    this.likes = {};
    this.comments = {};
    this.tags = {};
    
    this.init();
  }

  async init() {
    const users = await models.User.findAll({ where: { status: 1 }, raw: true });
    const channels = await models.Channel.findAll({ where: { status: 0}, raw: true });
    const reads = await models.Read.findAll({ where: { status: 1}, raw: true });
    const gammatags = await models.Gammatag.findAll({ where: { status: 0}, raw: true });
    const posts = await models.Post.findAll({ where: { status: 0}, raw: true });
    const postRates = await models.PostRate.findAll({ where: { status: 1}, raw: true });
    const postComments = await models.PostComment.findAll({ where: { status: { [Op.lt]: 2 }}, raw: true });

    users.forEach(user => {
      this.users[user.id] = this.g.createNode('user', user);
    });
    channels.forEach(channel => {
      this.channels[channel.id] = this.g.createNode('channel', channel);
      if (channel.type === 0) {
        this.g.createEdge('entry').link(this.rootNode, this.channels[channel.id]).setDistance(Distants.Root);
      }
    });
    reads.forEach(read => {
      if (read.type === 0) {
        this.reads.user[read.id] = this.g.createEdge('read', {type: 'user'}).link(this.users[read.user_id], this.users[read.reading_id]).setDistance(Distants.Read);
      } else {
        this.reads.channel[read.id] = this.g.createEdge('read', {type: 'channel'}).link(this.users[read.user_id], this.channels[read.reading_id]).setDistance(Distants.Read);
      }
    });
    gammatags.forEach(gammatag => {
      this.gammatags[gammatag.name] = this.g.createNode('gammatag', gammatag);
    });
    posts.forEach(post => {
      this.posts[post.id] = this.g.createNode('post', post);
      if (post.author_id) {
        this.issues.user[post.id] = this.g.createEdge('issue', {type: 'user'}).link(this.users[post.author_id], this.posts[post.id]).setDistance(Distants.Issue);
      } else if (post.channel_id) {
        this.issues.channel[post.id] = this.g.createEdge('issue', {type: 'channel'}).link(this.channels[post.channel_id], this.posts[post.id]).setDistance(Distants.Issue);
      }
      const tags = _.compact(post.gammatags.split(','));
      tags.forEach(tag => {
        this.tags[tag] = this.g.createEdge('tag').link(this.gammatags[tag], this.posts[post.id]).setDistance(Distants.Tag);
      });
    });
    postRates.forEach(postRate => {
      this.likes[postRate.id] = this.g.createEdge('like').link(this.users[postRate.user_id], this.posts[postRate.post_id]).setDistance(Distants.Like);
    });
    postComments.forEach(postComment => {
      this.comments[postComment.id] = this.g.createEdge('comment').link(this.users[postComment.user_id], this.posts[postComment.post_id]).setDistance(Distants.Comment);
    });
  }

  findUsers(user_id: number, key: string, offset: number = 0, limit: number = 20) {
    const entry = this.users[user_id] || this.rootNode;

    key = key.toLowerCase();
    let results = this.g.closest(entry, {
      compare: function(node) {
        return (node.entity === 'user' && (node.get('username').toLowerCase().indexOf(key) > -1 || node.get('first_name').toLowerCase().indexOf(key) > -1 || node.get('last_name').toLowerCase().indexOf(key) > -1))
          || (node.entity === 'channel' && (node.get('username').toLowerCase().indexOf(key) > -1 || node.get('name').toLowerCase().indexOf(key) > -1));
      },
      minDepth: 1,
    });
  
    let users = [];
    for (let i=offset; i<offset+limit && i<results.length; i++) {
      users.push({id: results[i].end().get('id'), type: results[i].end().entity});
    }

    return users;
  }

  findPosts(user_id: number, key: string, type: number = -1, offset: number = 0, limit: number = 20) {
    const entry = this.users[user_id] || this.rootNode;

    key = key.toLowerCase();
    let results = this.g.closest(entry, {
      compare: function(node) {
        return node.entity === 'post' && (type === -1 || node.get('type') === type)
          && (node.get('title').toLowerCase().indexOf(key) > -1 || node.get('description').toLowerCase().indexOf(key) > -1 || node.get('gammatags').toLowerCase().indexOf(key) > -1);
      },
      minDepth: 2,
    });
  
    let posts = [];
    for (let i=offset; i<offset+limit && i<results.length; i++) {
      posts.push(results[i].end().get('id'));
    }

    return posts;
  }


  addUser(user: any) {
    if (!user || this.users[user.id]) {
      logger.error('graph add User error: ' + (!user)? 'null value of user': 'duplicated user ' + user);
      return;
    }
    this.users[user.id] = this.g.createNode('user', user);
  }

  addChannel(channel: any) {
    if (!channel || this.channels[channel.id]) {
      logger.error('graph add Chanel error: ' + (!channel)? 'null value of channel': 'duplicated channel ' + channel);
      return;
    }
    this.channels[channel.id] = this.g.createNode('channel', channel);
    if (channel.type === 0) {
      this.g.createEdge('entry').link(this.rootNode, this.channels[channel.id]).setDistance(Distants.Root);
    }
  }

  readUser(read: any) {
    if (!read) {
      logger.error('graph read User error: null value of read');
      return;
    }
    if (read.status === 0) {
      if (!this.reads.user[read.id]) {
        logger.error('graph read User error: ' + 'not existing read - ' + read);
        return;
      }

      this.reads.user[read.id].unlink();
      delete this.reads.user[read.id];
    } else {
      if (!this.reads.user[read.id]) {
        this.reads.user[read.id] = this.g.createEdge('read', {type: 'user'});
      }
      this.reads.user[read.id].link(this.users[read.user_id], this.users[read.reading_id]).setDistance(Distants.Read);
    }
  }

  readChannel(read: any) {
    if (!read) {
      logger.error('graph read Channel error: null value of read');
      return;
    }
    if (read.status === 0) {
      if (!this.reads.channel[read.id]) {
        logger.error('graph read Channel error: ' + 'not existing read - ' + read);
        return;
      }

      this.reads.channel[read.id].unlink();
      delete this.reads.channel[read.id];
    } else {
      if (!this.reads.channel[read.id]) {
        this.reads.channel[read.id] = this.g.createEdge('read', {type: 'channel'});
      }
      this.reads.channel[read.id].link(this.users[read.user_id], this.channels[read.reading_id]).setDistance(Distants.Read);
    }
  }

  addGammatag(gammatag: any) {
    if (!gammatag || this.gammatags[gammatag.name]) {
      logger.error('graph add gammatag error: ' + (!gammatag)? 'null value of gammatag': 'duplicated gammatag ' + gammatag);
      return;
    }
    this.gammatags[gammatag.name] = this.g.createNode('gammatag', gammatag);
  }

  userPost(post: any) {
    if (!post || this.posts[post.id]) {
      logger.error('graph add post error: ' + (!post)? 'null value of gammatag': 'duplicated post ' + post);
      return;
    }
    this.posts[post.id] = this.g.createNode('post', post);
    this.issues.user[post.id] = this.g.createEdge('issue', {type: 'user'}).link(this.users[post.author_id], this.posts[post.id]).setDistance(Distants.Issue);
    const tags = _.compact(post.gammatags.split(','));
    tags.forEach(tag => {
      if (!this.gammatags[tag]) {
        logger.error('graph add post error: can\'t find gammatag - ' + tag);
        return;
      }
      this.tags[tag] = this.g.createEdge('tag').link(this.gammatags[tag], this.posts[post.id]).setDistance(Distants.Tag);
    });
  }

  channelPost(post: any) {
    if (!post || this.posts[post.id]) {
      logger.error('graph add post error: ' + (!post)? 'null value of gammatag': 'duplicated post ' + post);
      return;
    }
    this.posts[post.id] = this.g.createNode('post', post);
    this.issues.channel[post.id] = this.g.createEdge('issue', {type: 'channel'}).link(this.channels[post.channel_id], this.posts[post.id]).setDistance(Distants.Issue);
    const tags = _.compact(post.gammatags.split(','));
    tags.forEach(tag => {
      if (!this.gammatags[tag]) {
        logger.error('graph add post error: can\'t find gammatag - ' + tag);
        return;
      }
      this.tags[tag] = this.g.createEdge('tag').link(this.gammatags[tag], this.posts[post.id]).setDistance(Distants.Tag);
    });
  }

  ratePost(postRate: any) {
    if (!postRate) {
      logger.error('graph rate post error: null value of rate');
      return;
    }
    if (postRate.status === 0) {
      if (!this.likes[postRate.id]) {
        logger.error('graph rate post error: ' + 'not existing rate - ' + postRate);
        return;
      }

      this.likes[postRate.id].unlink();
      delete this.likes[postRate.id];
    } else {
      if (!this.likes[postRate.id]) {
        this.likes[postRate.id] = this.g.createEdge('like');
      }
      this.likes[postRate.id].link(this.users[postRate.user_id], this.posts[postRate.post_id]).setDistance(Distants.Like);
    }
  }

  commentPost(postComment: any) {
    if (!postComment) {
      logger.error('graph comment post error: null value of comment');
      return;
    }
    if (postComment.status === 0) {
      if (!this.comments[postComment.id]) {
        logger.error('graph comment post error: ' + 'not existing comment - ' + postComment);
        return;
      }

      this.comments[postComment.id].unlink();
      delete this.comments[postComment.id];
    } else {
      if (!this.comments[postComment.id]) {
        this.comments[postComment.id] = this.g.createEdge('comment');
      }
      this.comments[postComment.id].link(this.users[postComment.user_id], this.posts[postComment.post_id]).setDistance(Distants.Comment);
    }
  }
}

const graph = new GraphManager();

export default graph;