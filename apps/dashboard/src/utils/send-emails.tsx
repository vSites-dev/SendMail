import VerifyEmail from "@/components/emails/verify-email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface sendVerificationEmailProps {
  email: string;
  name: string;
  verificationUrl: string;
}
async function sendVerificationEmail({ email, name, verificationUrl }: sendVerificationEmailProps) {
  try {
    const res = await resend.emails.send({
      from: "SendMail <sendmail@vsites.dev>",
      to: email,
      subject: "SendMail - Email cím megerősítése",
      react: <VerifyEmail verificationUrl={verificationUrl} name={name} />,
    });

    return res
  }
  catch (error) {
    console.log(error);

    return error;
  }
}

export { sendVerificationEmail };