import VerifyEmail from "@/components/emails/verify-email";
import ProjectInvitation from "@/components/emails/project-invitation";
import { Resend } from "resend";
import { VerifyEmailProps, ProjectInvitationEmailProps } from "@/types";
import { env } from "@/env";
import transporter from "./transporter";
import { render } from "@react-email/components";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail({ email, name, verificationUrl }: VerifyEmailProps) {
  try {
    if (env.NODE_ENV === "development") {
      const emailHtml = await render(<VerifyEmail email={email} verificationUrl={verificationUrl} name={name} />);

      const res = await transporter.sendMail({
        from: "SendMail <sendmail@vsites.dev>",
        to: email,
        subject: "SendMail - Email cím megerősítése",
        text: `Kattints az alábbi linkre az email cím megerősítéséhez: ${verificationUrl}`,
        html: emailHtml
      });

      return res
    }

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
    if (env.NODE_ENV === "development") {
      const emailHtml = await render(<ProjectInvitation email={email} invitedByUsername={invitedByUsername} invitedByEmail={invitedByEmail} teamName={teamName} inviteLink={inviteLink} />);

      const res = await transporter.sendMail({
        from: "SendMail <sendmail@vsites.dev>",
        to: email,
        subject: "SendMail - Projekt meghívó",
        text: `Kattints az alábbi linkre az email cím megerősítéséhez: ${inviteLink}`,
        html: emailHtml
      });

      return res
    }

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