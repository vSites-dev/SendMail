import { SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses'
import { sesClient } from '../config/aws'
import transporter from '../lib/transporter'
import MarkdownIt from 'markdown-it'

export interface SendEmailParams {
  from: string
  to: string
  subject: string
  body: string
}

export class EmailService {
  private md: MarkdownIt

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true
    })
  }

  private convertMarkdownToHtml(markdown: string): string {
    const convertedHtml = this.md.render(markdown)
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #222;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              font-weight: 600;
            }
            h1 { font-size: 2em; }
            h2 { font-size: 1.75em; }
            h3 { font-size: 1.5em; }
            h4 { font-size: 1.25em; }
            h5 { font-size: 1em; }
            h6 { font-size: 0.85em; }
            p {
              margin: 0 0 1em;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            ul, ol {
              margin: 1em 0;
              padding-left: 2em;
            }
            li {
              margin-bottom: 0.5em;
            }
            blockquote {
              border-left: 4px solid #ddd;
              margin: 1em 0;
              padding-left: 1em;
              color: #666;
            }
            code {
              font-family: monospace;
              background-color: #f5f5f5;
              padding: 0.2em 0.4em;
              border-radius: 3px;
            }
            pre {
              background-color: #f5f5f5;
              border-radius: 3px;
              padding: 1em;
              overflow: auto;
            }
            pre code {
              background-color: transparent;
              padding: 0;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            hr {
              border: none;
              border-top: 1px solid transparent;
              margin: 2em 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
            }
            table, th, td {
              border: 1px solid #ddd;
            }
            th, td {
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
          </style>
        </head>
        <body>
          ${convertedHtml}
        </body>
      </html>
    `
  }

  async sendEmail(params: SendEmailParams) {
    const htmlBody = this.convertMarkdownToHtml(params.body)

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
          Html: {
            Data: htmlBody,
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
      const htmlBody = this.convertMarkdownToHtml(params.body)

      await transporter.sendMail({
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: htmlBody
      })
      return { success: true }
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }
}
