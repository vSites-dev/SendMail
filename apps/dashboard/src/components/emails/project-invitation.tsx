import { ProjectInvitationEmailProps } from "@/types";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

const ProjectInvitationEmail = ({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
}: ProjectInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Meghívás a {teamName} projektre a SendMail platformon</Preview>
    <Tailwind>
      <Body className="bg-background">
        <Container className="mx-auto px-[20px] py-[40px] max-w-[560px]">
          <Heading className="text-center font-bold text-2xl mt-6">
            Projekt meghívó 🚀
          </Heading>

          <Section className="my-6">
            <Text className="text-center text-lg text-gray-800 font-semibold mb-4">
              Kedves {email}!
            </Text>

            <Text className="text-gray-700 mb-4">
              <span className="font-semibold">{invitedByUsername}</span> ({invitedByEmail}) meghívta Önt, hogy csatlakozzon a következő projekthez:
            </Text>

            <Section className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <Text className="text-center font-bold text-xl text-violet-600 mb-1">
                {teamName}
              </Text>
              <Text className="text-center text-gray-600 text-sm">
                SendMail Projekt
              </Text>
            </Section>

            <Text className="text-gray-700 mb-6">
              A meghívás elfogadásához és a projekthez való csatlakozáshoz kattintson az alábbi gombra:
            </Text>

            <Button
              className="bg-violet-500 hover:bg-violet-600 rounded-md py-3 text-white text-base font-bold no-underline text-center mx-auto w-full mb-4"
              href={inviteLink}
            >
              Meghívás elfogadása
            </Button>

            <Text className="text-center text-sm text-gray-600 mb-2">
              Vagy másolja be ezt a linket a böngészőjébe:
            </Text>
            <Text className="text-center text-xs text-gray-500 break-all mb-4">
              {inviteLink}
            </Text>

            <Text className="text-center text-sm text-gray-600">
              Ha nem szeretne csatlakozni ehhez a projekthez, egyszerűen hagyja figyelmen kívül ezt az e-mailt.
            </Text>
          </Section>

          <Hr className="border border-gray-200 mb-6" />

          <Section className="mb-6 text-gray-500 text-center text-sm">
            <Text>
              © {new Date().getFullYear()} SendMail. Minden jog fenntartva.
            </Text>
            <Link href="https://sendmail.dev/" className="text-violet-500 hover:text-violet-600">
              https://sendmail.dev/
            </Link>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default ProjectInvitationEmail;
