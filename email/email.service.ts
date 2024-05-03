import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
let aws = require("@aws-sdk/client-ses");

@Injectable()
export class EmailService {
    private readonly transporter;
    constructor(private readonly configService: ConfigService) {
        const ses = new aws.SES({
            apiVersion: "2010-12-01",
            region: this.configService.get('SES_REGION'),
            credentials: {
                accessKeyId: this.configService.get('SES_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('SES_SECRET_ACCESS_KEY')
            }
        });

        // create Nodemailer SES transporter
        this.transporter = nodemailer.createTransport({
            SES: { ses, aws },
        });

    }

    async sendEmailWithAttachment(to, stallion, comment,pdfBuffer: Buffer) {
            const mailOptions = {
            from: `"${this.configService.get(
                'mail.defaultName',
            )}" <${this.configService.get('mail.defaultEmail')}>`,
            to: to,                              // Recipient's email address
            cc: 'support@stallionmatch.com',
            subject: `Check out these stats for ${stallion} on Stallion Match`,
            text:comment,
            attachments: [
                {
                    filename: 'stallion-report.pdf',
                    content: pdfBuffer,
                },
            ],
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Email sent with attachment');
            return {
                message: 'Mail  has been sent successfully' 
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

}