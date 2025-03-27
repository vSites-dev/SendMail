import VerifyEmail from "@/components/emails/verify-email";
import ProjectInvitation from "@/components/emails/project-invitation";
import { Resend } from "resend";
import { VerifyEmailProps, ProjectInvitationEmailProps } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail({ email, name, verificationUrl }: VerifyEmailProps) {
  try {
    const res = await resend.emails.send({
      from: "SendMail <sendmail@vsites.dev>",
      to: email,
      subject: "SendMail - Email cím megerősítése",
      react: <VerifyEmail email={email} verificationUrl={verificationUrl} name={name} />,
    });

    return res
  }
  catch (error) {
    console.log(error);

    return error;
  }
}

async function sendProjectInvitationEmail({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
}: ProjectInvitationEmailProps) {
  try {
    const res = await resend.emails.send({
      from: "SendMail <sendmail@vsites.dev>",
      to: email,
      subject: "SendMail - Projekt meghívó",
      react: <ProjectInvitation email={email} invitedByUsername={invitedByUsername} invitedByEmail={invitedByEmail} teamName={teamName} inviteLink={inviteLink} />,
    });

    return res
  }
  catch (error) {
    console.log(error);

    return error;
  }
}

export { sendVerificationEmail, sendProjectInvitationEmail };