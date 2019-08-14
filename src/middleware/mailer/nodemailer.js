/* @flow */

import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';

import config from '../../config';
import logger from '../../middleware/logger';

class NodemailerSmtpApi {
  transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: config.mail_sender_email, // generated ethereal user
        pass: config.mail_sender_email_pass // generated ethereal password
      },
    });
  }
   
  async sendConfirmationEmail(data:any) :Promise<any> {
    let htmlToSend :any = compileTemplate(data, '/templates/confirm-email.html');
    
    // send mail with defined transport object
    let responseFromEmail = await this.transporter.sendMail({
      from: `"Journile" <${config.mail_sender_email}>`, // sender address
      to: data.email, // list of receivers
      subject: config.confirm_mail_subject, // Subject line
      html: htmlToSend // html body
    });
    
    logger.info("Message sent: %s", responseFromEmail.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    logger.info("Preview URL: %s", nodemailer.getTestMessageUrl(responseFromEmail));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    
    return responseFromEmail;
  }
}

let readHTMLFile = function(path:string) :string {
  try{
    let file = fs.readFileSync(path, {encoding: 'utf-8'});
    return file;
  } catch(ex) {
    logger.error(ex);
    throw ex;
  }
};

let compileTemplate = function(data: any, templatePath: string) :any {
  let html:string = readHTMLFile(path.join(__dirname, templatePath));
  let template:handlebars.TemplateDelegate<any> = handlebars.compile(html);
  let replacements:any = {
    firstname: data.first_name,
    lastname: data.last_name, 
    activationcode: data.activation_code,
    activationlink: data.activation_link,
    companyname: config.company_name,
    companyaddress: config.company_address,
    companymobilenr: config.company_phonenumber
  };
  let htmlToSend:string = template(replacements);
  return htmlToSend;
}

const theNodemailer = new NodemailerSmtpApi();
export default theNodemailer;