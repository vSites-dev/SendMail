import { SESClient } from "@aws-sdk/client-ses";

// Set the AWS Region and initialize SES
const sesClient = new SESClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || ''
  }
});

export { sesClient };
