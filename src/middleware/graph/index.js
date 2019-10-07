/* @flow */

import ug from 'ug';
import Sequelize from 'sequelize';
import _ from 'lodash';

import models from '../../models';

const Op = Sequelize.Op;

const Distants = {
  Read: 1,
  Issue: 1,
  Like: 2,
  Comment: 2,
  Tag: 3,
}

class GraphManager {
  g: any;
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

  findUsers(user_id: number, key: string, skip: number = 0, limit: number = 20) {
    key = key.toLowerCase();

    let results = this.g.closest(this.users[user_id], {
      compare: function(node) {
        return (node.entity === 'user' && (node.get('username').toLowerCase().indexOf(key) > -1 || node.get('first_name').toLowerCase().indexOf(key) > -1 || node.get('last_name').toLowerCase().indexOf(key) > -1))
          || (node.entity === 'channel' && (node.get('username').toLowerCase().indexOf(key) > -1 || node.get('name').toLowerCase().indexOf(key) > -1));
      },
    });
  
    let users = [];
    for (let i=skip; i<skip+limit && i<results.length; i++) {
      users.push({id: results[i].end().get('id'), type: results[i].end().entity});
    }

    return users;
  }

  findPosts(user_id: number, key: string, skip: number = 0, limit: number = 20) {
    key = key.toLowerCase();

    let results = this.g.closest(this.users[user_id], {
      compare: function(node) {
        return node.entity === 'post' && (node.get('title').toLowerCase().indexOf(key) > -1 || node.get('description').toLowerCase().indexOf(key) > -1 || node.get('gammatags').toLowerCase().indexOf(key) > -1);
      },
      minDepth: 2,
    });
  
    let posts = [];
    for (let i=skip; i<skip+limit && i<results.length; i++) {
      posts.push(results[i].end().get('id'));
    }

    return posts;
  }
}

const graph = new GraphManager();

export default graph;