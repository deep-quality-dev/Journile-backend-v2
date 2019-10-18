/* @flow */

import AWS from 'aws-sdk';
import axios from 'axios';
import Url from 'url-parse';
import crypto from 'crypto';
import uuid from 'uuid/v4';
import S3Stream from 's3-upload-stream';

import config from '../../config';
import logger from '../logger';


let s3: AWS.S3 = new AWS.S3({
  accessKeyId: config.aws_accesskey,
  secretAccessKey: config.aws_secretkey,
});

const s3Stream = S3Stream(s3);

class S3FileUploader {
  async uploadImageFromUrl(url: string) {
    try
    {
      if(!url || typeof url != 'string') throw new Error('Missing parameter \'url\'.');

      if (url.startsWith(`${config.server_root_url}public/media/`)) {
        // already uploaded
        return url;
      }
      
      const parsed = new Url(url);
      let extension = 'png';
      let fileName: string = parsed.pathname.substring(parsed.pathname.lastIndexOf('/')+1);

      if (fileName.lastIndexOf('.') > -1) {
        extension = fileName.split('.')[1];
      }

      const rand = uuid();
      const fileKey = `${rand}.${extension}`;

      let response = await axios({ method: 'get', url, responseType: 'arraybuffer' }).then( async result => {
        return await s3.putObject({
          ACL: 'public-read',
          Bucket: config.aws_s3_bucket,
          Body : result.data,
          Key : fileKey,
          ContentType: `image/png`,
        }).promise();
      })
      .catch( err => {
        throw err;
      });
      
      const cipher = crypto.createCipher('aes256', config.secret_key);
      const hash = cipher.update(fileKey, 'utf8', 'hex') + cipher.final('hex');
      const fileUrl = `${config.server_root_url}public/media/image/${hash}/${fileKey}`;

      return fileUrl;
    } catch(ex){
      logger.error('Error on utility.S3FileUpload.uploadImageFromUrl: ' + ex);
      throw ex;
    }
  };
  
  async uploadVideoFile(stream: any) {
    try
    {
      const rand = uuid();
      const fileKey = `${rand}.mp4`;

      let response = await s3.putObject({
        ACL: "public-read",
        Bucket: config.aws_s3_bucket,
        Body : stream,
        Key : fileKey,
        ContentType: 'video/mp4',
      }).promise();
      
      const cipher = crypto.createCipher('aes256', config.secret_key);
      const hash = cipher.update(fileKey, 'utf8', 'hex') + cipher.final('hex');
      let fileUrl = `${config.server_root_url}public/media/video/${hash}/${fileKey}/playlist.m3u8`;
      
      return fileUrl;
    } catch(ex){
      logger.error('Error on uploadFileFromStream: ' + ex);
      throw ex;
    }
  };
  
  async uploadFileFromStream(inputStream: any, fileName: string, mimetype: string) {
    try
    {
      if(!inputStream) throw new Error('Missing parameter \'inputStream\'.');

      let extension = 'unkown';
      if (fileName.lastIndexOf('.') > -1) {
        extension = fileName.split('.')[1];
      }

      const rand = uuid();
      const fileKey = `${rand}.${extension}`;

      let upload = s3Stream.upload({
        ACL: 'public-read',
        Bucket: config.aws_s3_bucket,
        Key : fileKey,
        ContentType: mimetype,
      });

      inputStream.pipe(upload);

      const result = await new Promise((resolve, reject) => {
        upload.on('error', reject);
        upload.on('uploaded', (details) => resolve(details))
      })
      
      const cipher = crypto.createCipher('aes256', config.secret_key);
      const hash = cipher.update(fileKey, 'utf8', 'hex') + cipher.final('hex');
      const mediaType = mimetype.split('/')[0];
      let fileUrl = `${config.server_root_url}public/media/${mediaType}/${hash}/${fileKey}`;

      if (mediaType === 'video') fileUrl += '/playlist.m3u8';
      
      return fileUrl;
    } catch(ex){
      logger.error('Error on uploadFileFromStream: ' + ex);
      throw ex;
    }
  };
}

let s3FileUploader = new S3FileUploader();

export default s3FileUploader;