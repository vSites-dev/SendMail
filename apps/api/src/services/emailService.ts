import { SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses'
import { sesClient } from '../config/aws'
import transporter from '../lib/transporter'

export interface SendEmailParams {
  from: string
  to: string
  subject: string
  body: string
}

export class EmailService {
  async sendEmail(params: SendEmailParams) {
    const sendEmailParams: SendEmailCommandInput = {
      Source: params.from,
      Destination: {
        ToAddresses: [params.to]
      },
      Message: {
        Subject: {
          Data: params.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: params.body,
            Charset: 'UTF-8'
          }
        }
      }
    }

    try {
      const command = new SendEmailCommand(sendEmailParams)
      const result = await sesClient.send(command)
      return { success: true, messageId: result.MessageId }
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  async sendEmailToMailHog(params: SendEmailParams) {
    try {
      await transporter.sendMail({
        from: params.from,
        to: params.to,
        subject: params.subject,
        text: params.body
      })
      return { success: true }
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }
}
