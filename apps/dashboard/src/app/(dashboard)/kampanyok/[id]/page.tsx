"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  Link as BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Home,
  Megaphone,
  Users,
  Mail,
  Clock,
  Settings,
  Calendar,
  BadgePercent,
  ChevronRight,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GetByIdCampaignType } from "@/server/api/routers/campaigns";
import { motion } from "framer-motion";
import { CampaignContacts } from "@/components/kampanyok/contacts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { AddContactsModal } from "@/components/kampanyok/add-contacts-modal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);

  const {
    data: campaign,
    isLoading,
    error,
  } = api.campaign.getById.useQuery(
    {
      id: params.id as string,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  );

  const uniqueEmails = campaign?.emails
    ? new Set(campaign.emails.map((email) => `${email.subject}-${email.from}`))
      .size
    : 0;

  if (isLoading) {
    return <CampaignDetailSkeleton />;
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-bold">Kampány nem található</h1>
        <p className="text-muted-foreground mb-4">
          Az adott kampány nem létezik vagy nincs hozzáférésed.
        </p>
        <Button onClick={() => router.push("/kampanyok")}>
          Vissza a kampányokhoz
        </Button>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home size={20} strokeWidth={1.6} />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/kampanyok">Kampányok</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{campaign.name}</BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="max-w-6xl w-full mx-auto h-full py-6 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className="flex gap-3 items-center"
          >
            <div
              className={cn(
                "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
              )}
            >
              <Megaphone className="size-5" />
            </div>

            <h1 className="text-2xl title">{campaign.name}</h1>
            <Badge
              variant={campaign.status === "COMPLETED" ? "success" : "outline"}
            >
              {campaign.status === "COMPLETED" ? "Befejezve" : "Ütemezve"}
            </Badge>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  Kontaktok
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaign.contacts.length}
                </div>
                <p className="text-muted-foreground text-sm">
                  Kontakt a kampányban
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  Emailek
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaign.emails.length}
                </div>
                <p className="text-muted-foreground text-sm">
                  Összesen {uniqueEmails} email blokk
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Létrehozva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </div>
                <p className="text-muted-foreground text-sm">
                  {new Date(campaign.createdAt).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="contacts">
              <TabsList>
                <TabsTrigger value="contacts" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Kontaktok
                </TabsTrigger>
                <TabsTrigger value="emails" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Emailek
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Beállítások
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="contacts" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Kontaktok</h2>
                    <Button
                      onClick={() => setIsContactsModalOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="size-4" />
                      Új kontakt hozzáadása
                    </Button>
                  </div>

                  <CampaignContacts
                    campaign={campaign}
                    onContactRemoved={() => {
                      router.refresh();
                    }}
                  />
                </TabsContent>

                <TabsContent value="emails">
                  <Card>
                    <CardHeader>
                      <CardTitle>Emailek</CardTitle>
                      <CardDescription>
                        Az összes email ami kiküldésre került ebben a
                        kampányban.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {campaign.emails.length === 0 ? (
                        <div className="text-center py-10">
                          <Mail className="size-10 mx-auto text-muted-foreground opacity-30 mb-2" />
                          <p className="text-muted-foreground">
                            Nincs még email ebben a kampányban
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-4 font-medium">
                                    Tárgy
                                  </th>
                                  <th className="text-left py-2 px-4 font-medium">
                                    Feladó
                                  </th>
                                  <th className="text-left py-2 px-4 font-medium">
                                    Címzett
                                  </th>
                                  <th className="text-left py-2 px-4 font-medium">
                                    Státusz
                                  </th>
                                  <th className="text-left py-2 px-4 font-medium">
                                    Küldve
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {campaign.emails.map((email) => (
                                  <tr key={email.id} className="border-b">
                                    <td className="py-2 px-4">
                                      <Link
                                        className="hover:underline relative"
                                        href={`/emailek/${email.id}`}
                                      >
                                        {email.subject}{" "}
                                        <ExternalLink className="size-3 absolute -right-5 top-0 bottom-0 m-auto" />
                                      </Link>
                                    </td>
                                    <td className="py-2 px-4">{email.from}</td>
                                    <td className="py-2 px-4">
                                      <Link
                                        className="hover:underline relative"
                                        href={`/kontaktok/${email.contactId}`}
                                      >
                                        {campaign.contacts.find(
                                          (c) => c.id === email.contactId,
                                        )?.email || "Ismeretlen"}
                                        <ExternalLink className="size-3 absolute -right-5 top-0 bottom-0 m-auto" />
                                      </Link>
                                    </td>
                                    <td className="py-2 px-4">
                                      <Badge
                                        variant={
                                          email.status === "SENT"
                                            ? "success"
                                            : email.status === "DELIVERED"
                                              ? "success"
                                              : email.status === "QUEUED"
                                                ? "outline"
                                                : "destructive"
                                        }
                                      >
                                        {email.status === "SENT"
                                          ? "Elküldve"
                                          : email.status === "DELIVERED"
                                            ? "Kézbesítve"
                                            : email.status === "QUEUED"
                                              ? "Várakozik"
                                              : email.status === "FAILED"
                                                ? "Sikertelen"
                                                : email.status}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-4">
                                      {email.sentAt
                                        ? new Date(
                                          email.sentAt,
                                        ).toLocaleString()
                                        : "Nem küldve"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Kampány beállítások</CardTitle>
                      <CardDescription>
                        A kampányhoz kapcsolódó beállítások és információk.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Kampány név
                          </h3>
                          <p className="font-medium">{campaign.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Státusz
                          </h3>
                          <div className="font-medium">
                            <Badge
                              variant={
                                campaign.status === "COMPLETED"
                                  ? "success"
                                  : "outline"
                              }
                            >
                              {campaign.status === "COMPLETED"
                                ? "Befejezve"
                                : "Ütemezve"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Létrehozás dátuma
                          </h3>
                          <p className="font-medium">
                            {new Date(campaign.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Utolsó frissítés
                          </h3>
                          <p className="font-medium">
                            {new Date(campaign.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>

      <AddContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        campaignId={campaign.id}
      />
    </>
  );
}

function CampaignDetailSkeleton() {
  return (
    <>
      <DashboardHeader>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home size={20} strokeWidth={1.6} />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/kampanyok">Kampányok</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>
            <Skeleton className="h-5 w-[200px]" />
          </BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="max-w-6xl w-full mx-auto h-full py-6 px-4">
        <div className="space-y-6">
          <div className="flex gap-3 items-center">
            <div
              className={cn(
                "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
              )}
            >
              <Megaphone className="size-5" />
            </div>

            <Skeleton className="h-8 w-[300px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-[100px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[60px] mb-2" />
                  <Skeleton className="h-4 w-[150px]" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Skeleton className="h-10 w-[400px] mb-6" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </main>
    </>
  );
}
