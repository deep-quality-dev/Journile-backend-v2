import { Router, Request, Response, NextFunction } from "express";
import axios from 'axios';
import jwt from 'jsonwebtoken';

import config from '../config';
import logger from '../middleware/logger';

const router = Router();

router.route("/")
	.get(function(req: Request, res: Response, next: NextFunction) {
		try {
			const url = `https://s3.amazonaws.com/${config.aws_s3_bucket}/${req.query.name}`;
			if(!req.query.sk || req.query.sk == '') { 
				res.status(500).json({
					messages: [ "Internal Server Error", "Missing parameter \'sk\'." ]
				});				
				return;
			}
			if(!req.query.da || req.query.da =='') { 
				res.status(500).json({
					messages: [ "Internal Server Error", "Missing parameter \'da\'." ]
				});
				return;
			}
			let decoded = jwt.verify(req.query.sk, config.secret_key, {ignoreExpiration: true});
			let arrName = req.query.name.split(".");
			arrName.pop();
			if(arrName[0] != decoded){
				res.status(500).json({
					messages: [ "Internal Server Error", "Missing parameter \'sk\'." ]
				});
				return;
			}
			let reqData = new Date(Number(req.query.da));
			if(isNaN(reqData.getDate())) {
				res.status(500).json({
					messages: ["Internal Server Error", "Missing parameter \'da\' in body."]
				});
				return;
			}
			axios({ method: 'get', url, responseType: 'stream' }).then(result => result.data.pipe(res));
		} catch (err) {
			logger.error("Error on router.public.media.get" + err);
			res.status(500).send("Error getting media.");
		}
	});

export default router;