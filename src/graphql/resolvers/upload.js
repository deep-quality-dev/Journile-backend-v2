/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

import models from '../../models';
import uploader from '../../middleware/uploader';
import logger from '../../middleware/logger';
import config from '../../config';

const uploadPath = path.join(__dirname, config.env_mode === 'production'? '../public/upload/': '../../../public/upload/');

ffmpeg.setFfmpegPath(ffmpegPath);

function asyncFFMpeg(ff: any) {
  return new Promise(function (resolve, reject) {
    ff.on('error', (err) => reject(err))
    .on('end', () => {
      resolve();
    });
  });
}

export default {
  Mutation: {
    upload: async (parent: any, args: any, context: any, info: any) => {
      const { file } = args
      const { createReadStream, filename, mimetype, encoding } = await file;
      let stream = createReadStream();

      if (mimetype.toLowerCase().startsWith('image')) {
        const url = await uploader.uploadFileFromStream(stream, filename, mimetype);

        return { url, filename, mimetype, encoding };
      } else if (mimetype.toLowerCase().startsWith('video')) {
        const url = await uploader.uploadFileFromStream(stream, filename, mimetype);

        let thumbUrl = null;
        try {
          const thumbDir = uploadPath + 'thumbnail/';
          if (!fs.existsSync(thumbDir)){
              fs.mkdirSync(thumbDir);
          }
          const thumbFileName = 'thumbnail_'+Date.now()+'.jpeg';
          stream = createReadStream();
          await asyncFFMpeg(ffmpeg(stream)
            .takeScreenshots({
              count: 1,
              filename: thumbFileName,
              timemarks: [ 5 ], // number of seconds
              }, thumbDir, function(err) {
            })
          );

          thumbUrl = await uploader.uploadFileFromStream(fs.createReadStream(thumbDir + thumbFileName), thumbFileName, 'image/jpeg');
          fs.unlinkSync(thumbDir + thumbFileName);
        } catch (err) {
          logger.error('Error on generating thumbnail:' + err);
        }

        return { url, thumbUrl, filename, mimetype, encoding };
      }

      throw new UserInputError('Unkown media type');
    },
  },
};