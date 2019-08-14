import AWS from 'aws-sdk';
import axios from 'axios';
import Url from 'url-parse';
import jwt from 'jsonwebtoken';
import uuid from 'uuid/v4';

import config from '../../config';
import logger from '../logger';


let s3: AWS.S3 = new AWS.S3({
  accessKeyId: config.aws_accesskey,
  secretAccessKey: config.aws_secretkey,
});

class S3FileUploader {
  async uploadImageFromUrl(url: string) {
    try
    {
      if(!url || typeof url != "string") throw new Error("Missing parameter \'url\'.");
      
      const parsed = new Url(url);
      let extension = "png";
      let fileName: string = parsed.pathname.substring(parsed.pathname.lastIndexOf("/")+1);

      if (fileName.lastIndexOf(".") > -1) {
        extension = fileName.split('.')[1];
      }

      const rand = uuid();
      const token = jwt.sign(rand, config.secret_key);
      const fileKey = `${rand}.${extension}`;
      const fileUrl = `${config.server_root_url}public/media?name=${fileKey}&sk=${token}&da=${new Date().getTime()}`;

      let response = await axios({ method: 'get', url, responseType: 'arraybuffer' }).then( async result => {
        return await s3.putObject({
          ACL: "public-read",
          Bucket: config.aws_s3_bucket,
          Body : result.data,
          Key : fileKey,
          ContentType: `image/png`,
        }).promise();
      })
      .catch( err => {
        throw err;
      });
      
      return fileUrl;
    } catch(ex){
      logger.error("Error on utility.S3FileUpload.uploadImageFromUrl: " + ex);
      throw ex;
    }
  };
}

let s3FileUploader = new S3FileUploader();

export default s3FileUploader;