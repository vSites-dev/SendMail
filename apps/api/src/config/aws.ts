import { SESClient } from "@aws-sdk/client-ses";
import { SESv2Client } from "@aws-sdk/client-sesv2";

const awsConfig = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || ''
  }
};

// Initialize SES clients
const sesClient = new SESClient(awsConfig);
const sesv2Client = new SESv2Client(awsConfig);

export { sesClient, sesv2Client };
