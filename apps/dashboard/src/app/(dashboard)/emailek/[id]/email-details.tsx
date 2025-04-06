"use client";

import {
  Mail,
  Calendar,
  Clock,
  User,
  Archive,
  ExternalLink,
  Link2,
} from "lucide-react";
import { Email, EmailStatus } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardContent,
  CardSeparator,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { emailStatuses } from "../columns";
import { ExtendedEmail } from "@/server/api/routers/emails";

export function EmailDetails({ email }: { email: ExtendedEmail }) {
  if (!email) return;

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rounded-lg">
          <div
            className={cn(
              "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border",
              emailStatuses[email.status].textColor,
            )}
          >
            <Mail className="size-6" />
          </div>

          <h1 className={cn("text-2xl title")}>{email.subject}</h1>
        </div>

        <Badge
          className={cn(
            "px-3 py-1 text-sm font-medium",
            emailStatuses[email.status].textColor,
          )}
          variant={"outline"}
        >
          {emailStatuses[email.status].label}
        </Badge>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email információk</CardTitle>
            </CardHeader>
            <CardSeparator />
            <CardContent className="my-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Címzett
                  </h3>
                  <Link
                    href={`/kontaktok/${email.contactId}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <User className="size-4" />
                    {email.contact.name
                      ? `${email.contact.name} (${email.contact.email})`
                      : email.contact.email}
                    <ExternalLink className="size-3" />
                  </Link>
                </div>

                {email.campaignId && email.campaign && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Kampány
                    </h3>
                    <Link
                      href={`/kampanyok/${email.campaignId}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Archive className="size-4" />
                      {email.campaign.name}
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                )}

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Létrehozva
                  </h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    {formatDate(email.createdAt)}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Elküldve
                  </h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    {formatDate(email.sentAt)}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Állapot
                  </h3>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        emailStatuses[email.status].bgColor,
                      )}
                    ></div>
                    {emailStatuses[email.status].label}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {email.clicks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kattintási adatok ({email.clicks.length})</CardTitle>
              </CardHeader>
              <CardSeparator />
              <CardContent className="mt-4">
                <div className="space-y-4">
                  {email.clicks.map((click, index) => (
                    <div key={click.id} className={cn(email.clicks.length > 1 && index < email.clicks.length - 1 && "border-b pb-3")}>
                      <div className="flex items-center gap-2">
                        <Link2 className="size-4 text-muted-foreground" />
                        <a
                          href={click.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          {click.link}
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="size-3" />
                        {new Date(click.createdAt).toLocaleDateString("hu-HU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email tartalma</CardTitle>
          </CardHeader>
          <CardSeparator />
          <CardContent className="my-4">
            <div
              className="prose p-4 border rounded-md shadow-sm bg-white"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
