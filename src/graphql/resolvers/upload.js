/* @flow */

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

import models from '../../models';
import uploader from '../../middleware/uploader';
import logger from '../../middleware/logger';

const uploadPath = path.join(__dirname, '../../../public/upload/');

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
        let uploadName = filename;
        let extension = 'unkown';
        if (filename.lastIndexOf('.') > -1) {
          extension = filename.split('.')[1];
        }

        const tempDir = uploadPath + 'temp/';
        if (!fs.existsSync(tempDir)){
          fs.mkdirSync(tempDir);
        }
        const tempFileName = `temp_${Date.now()}.${extension}`;
        let tempPath = tempDir + tempFileName;

        await new Promise((resolve, reject) => {
          stream
            .on('error', error => {
              fs.unlink(tempPath, () => {
                reject(error)
              })
            })
            .pipe(fs.createWriteStream(tempPath))
            .on('error', reject)
            .on('finish', resolve)
        })

        if (extension !== 'mp4') {
          uploadName = `${filename.split('.')[0]}.mp4`;
          const newFileName = `temp_${Date.now()}.mp4`;
          try {
            const ff = ffmpeg(tempPath)
              .output(tempDir + newFileName)
              .audioCodec('libmp3lame')
              .videoCodec('libx264');
            ff.run();
            await asyncFFMpeg(ff);
            fs.unlinkSync(tempPath);
            tempPath = tempDir + newFileName;
          } catch (err) {
            logger.error('Error on converting to mp4:' + err);
            fs.unlinkSync(tempDir + newFileName);
          }
        }
        
        const url = await uploader.uploadVideoFile(fs.createReadStream(tempPath));

        let thumbUrl = null;
        try {
          const thumbDir = uploadPath + 'thumbnail/';
          if (!fs.existsSync(thumbDir)){
            fs.mkdirSync(thumbDir);
          }
          const thumbFileName = 'thumbnail_'+Date.now()+'.jpeg';
          await asyncFFMpeg(ffmpeg(tempPath)
            .screenshots({
              // count: 1,
              filename: thumbFileName,
              timemarks: [ '20%' ],
              folder: thumbDir,
            })
          );

          thumbUrl = await uploader.uploadFileFromStream(fs.createReadStream(thumbDir + thumbFileName), thumbFileName, 'image/jpeg');
          fs.unlinkSync(thumbDir + thumbFileName);
        } catch (err) {
          logger.error('Error on generating thumbnail:' + err);
        }
        fs.unlinkSync(tempPath);

        return { url, thumbUrl, uploadName, mimetype, encoding };
      }

      throw new UserInputError('Unkown media type');
    },
  },
};