/* @flow */

import AWS from 'aws-sdk';
import handlebars from 'handlebars';
import fs from 'fs';

import config from '../../config';

class AwsSmtpApi {
  ses: AWS.SES;

  constructor() {
    this.ses = this.createAwsInstance();
  }

  createAwsInstance(){
    return new AWS.SES({
      accessKeyId: config.aws_accesskey,
      secretAccessKey: config.aws_secretkey,
      region: config.aws_smtp_region,
    }); 
  }
   
  async sendConfirmationEmail(data:any) :Promise<any> {
    let htmlToSend :any = compileTemplate(data, 'templates/confirm-email.html');
    let params = {
      Destination: { /* required */
        CcAddresses: [ ],
        ToAddresses: [ data.email ]
      },
      Message: { /* required */
        Body: { /* required */
          Html: { Charset: "UTF-8", Data: htmlToSend },
        },
        Subject: { Charset: 'UTF-8', Data: config.confirm_mail_subject }
      },
      Source: config.mail_sender_email, /* required */
      ReplyToAddresses: []
    }
    
    let responseFromEmail = await this.ses.sendEmail(params).promise();
    return responseFromEmail;
  }
}

let readHTMLFile = function(path:string) :string {
  try{
    let file = fs.readFileSync(path, {encoding: 'utf-8'});
    return file;
  } catch(ex) {
    console.log(ex);
    throw ex;
  }
};

let compileTemplate = function(data: any, templatePath: string) :any {
  let html:string = readHTMLFile(__dirname + templatePath);
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

const awsMailer = new AwsSmtpApi();
export default awsMailer;