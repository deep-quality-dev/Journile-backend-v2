/* @flow */

import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import crypto from 'crypto';

import config from '../config';
import logger from '../middleware/logger';

const router = Router();

function validate(req: Request, res: Response): boolean {
  const decipher = crypto.createDecipher('aes256', config.secret_key);
  const decrypted = decipher.update(req.params.hash, 'hex', 'utf8') + decipher.final('utf8');
  if(!req.params.filename || req.params.filename !== decrypted){
    res.status(404).json({
      messages: ['Not found']
    });
    return false;
  }

  return true;
}

router.route('/image/:hash/:filename')
  .get(function(req: Request, res: Response, next: NextFunction) {
    try {
      if(!validate(req, res)) {
        return;
      }
      
      const url = `https://s3.amazonaws.com/${config.aws_s3_bucket}/${req.params.filename}`;
      axios({ method: 'get', url, responseType: 'stream' }).then(result => result.data.pipe(res));
    } catch (err) {
      logger.error('Error on router.public.media.get' + err);
      res.status(500).send('Error getting media.');
    }
  });

router.route('/video/:hash/:filename/:key')
  .get(function(req: Request, res: Response, next: NextFunction) {
    try {
      if(!validate(req, res)) {
        return;
      }
      
      const url = `${config.wowza_server_root_url}/video/_definst_/mp4:stream/${req.params.filename}/${req.params.key}`;
      axios({ method: 'get', url, responseType: 'stream' }).then(result => result.data.pipe(res));
    } catch (err) {
      logger.error('Error on router.public.media.get' + err);
      res.status(500).send('Error getting media.');
    }
  });

export default router;