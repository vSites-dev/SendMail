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

interface VerifyEmailProps {
  verificationUrl: string;
  name: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

const VerifyEmail = ({ verificationUrl, name }: VerifyEmailProps) => (
  <Html>
    <Head />
    <Preview>Erősítse meg e-mail címét SendMail-nél</Preview>
    <Tailwind>
      <Body className="bg-background">
        <Container className="mx-auto px-[20px] py-[40px] max-w-[560px]">
          {/* 
          <Img
              src={`${baseUrl}/brand/icon.svg`}
            width="100"
            height="100"
            alt="SendMail Logó"
          /> 
          */}

          <Heading className="text-center font-bold text-2xl mt-6">
            Üdvözöljük a SendMail-nál! 👋
          </Heading>
          <Section className="my-6">
            <Text className="text-center text-lg text-gray-800 font-semibold mb-6">
              Kedves {name}!
            </Text>
            <Text className="text-center text-lg text-gray-700">
              Köszönjük, hogy regisztrált! Kérjük, erősítse meg e-mail címét,
              hogy elkezdhesse használni SendMail-t, a legjobb e-mail marketing
              platformot.
            </Text>
            <Button
              className="bg-indigo-500 rounded-md py-2 text-white text-base font-bold no-underline text-center mx-auto w-full mb-4"
              href={verificationUrl}
            >
              E-mail cím megerősítése
            </Button>
            <Text className="text-center text-sm text-gray-600">
              Ha nem Ön hozta létre fiókot kérjük, hagyja figyelmen kívül ezt az
              e-mailt.
            </Text>
          </Section>
          <Hr className="border border-gray-200 mb-6" />
          <Section className="mb-6 text-gray-500 text-center text-sm">
            <Text>
              © {new Date().getFullYear()} SendMail. Minden jog fenntartva.
            </Text>
            <Link href="https://leoai.hu/">https://leoai.hu/</Link>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default VerifyEmail;
