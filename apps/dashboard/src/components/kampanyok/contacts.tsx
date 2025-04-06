"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Mail,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { GetByIdCampaignType } from "@/server/api/routers/campaigns";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface CampaignContactsProps {
  campaign: GetByIdCampaignType;
  onContactRemoved?: () => void;
}

export function CampaignContacts({
  campaign,
  onContactRemoved,
}: CampaignContactsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [contactToDelete, setContactToDelete] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const itemsPerPage = 10;
  const router = useRouter();
  const utils = api.useUtils();

  // Filter contacts based on search term
  const filteredContacts =
    campaign?.contacts?.filter(
      (contact) =>
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  // Get current page of contacts
  const indexOfLastContact = currentPage * itemsPerPage;
  const indexOfFirstContact = indexOfLastContact - itemsPerPage;
  const currentContacts = filteredContacts.slice(
    indexOfFirstContact,
    indexOfLastContact,
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  // Get email status for a contact
  const getContactEmailStatus = (contactId: string) => {
    const emails =
      campaign?.emails?.filter((email) => email.contactId === contactId) || [];

    if (emails.length === 0) {
      return "No emails";
    }

    const sentCount = emails.filter(
      (email) => email.status === "SENT" || email.status === "DELIVERED",
    ).length;

    if (sentCount === emails.length) {
      return "Összes elküldve";
    } else if (sentCount > 0) {
      return `${sentCount}/${emails.length} elküldve`;
    } else {
      return "Várakozik";
    }
  };

  // Render a status badge for a contact
  const renderStatusBadge = (contactId: string) => {
    const status = getContactEmailStatus(contactId);

    if (status === "No emails") {
      return <Badge variant="outline">Nincs email</Badge>;
    } else if (status === "Összes elküldve") {
      return (
        <Badge variant="default" className="bg-green-600">
          Összes elküldve
        </Badge>
      );
    } else if (status.includes("elküldve")) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Részben elküldve
        </Badge>
      );
    } else {
      return <Badge variant="outline">Várakozik</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center w-full gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Keresés név vagy email alapján..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      {campaign?.contacts?.length === 0 ? (
        <div className="bg-white border rounded-md flex flex-col items-center justify-center p-10">
          <div className="mb-2 h-12 w-12 rounded-full bg-neutral-50 flex items-center justify-center">
            <Mail className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">Nincsenek kontaktok</h3>
          <p className="text-muted-foreground text-center max-w-sm pt-1">
            Még nem adtál hozzá kontaktokat ehhez a kampányhoz. Adj hozzá
            kontaktokat a kampányhoz a jobb felső sarokban lévő gombbal.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Név</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Státusz</TableHead>
                  <TableHead>Hozzáadva</TableHead>
                  <TableHead className="text-right">Műveletek</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nincs találat a keresési feltételekre
                    </TableCell>
                  </TableRow>
                ) : (
                  currentContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        {contact.name || "Névtelen"}
                      </TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{renderStatusBadge(contact.id)}</TableCell>
                      <TableCell>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() =>
                                setContactToDelete({
                                  id: contact.id,
                                  name: contact.name || "Névtelen",
                                  email: contact.email,
                                })
                              }
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-red-600"
                            >
                              <span className="sr-only">
                                Eltávolítás a kampányból
                              </span>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">Eltávolítás a kampányból</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {filteredContacts.length} kontakt, {indexOfFirstContact + 1}-
                {Math.min(indexOfLastContact, filteredContacts.length)} látható
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber = i + 1;
                    const isCurrentPage = pageNumber === currentPage;

                    // Show 5 pages with current page in the middle when possible
                    let pageToShow = pageNumber;
                    if (totalPages > 5 && currentPage > 3) {
                      if (currentPage + 2 <= totalPages) {
                        pageToShow = currentPage - 2 + i;
                      } else {
                        pageToShow = totalPages - 4 + i;
                      }
                    }

                    if (pageToShow <= totalPages) {
                      return (
                        <Button
                          key={pageToShow}
                          variant={
                            pageToShow === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          className={cn(
                            "w-8 h-8 mx-1",
                            pageToShow === currentPage && "pointer-events-none",
                          )}
                          onClick={() => paginate(pageToShow)}
                        >
                          {pageToShow}
                        </Button>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Warning Dialog for contact removal */}
      <ContactRemoveDialog
        isOpen={contactToDelete !== null}
        contactToDelete={contactToDelete}
        campaignId={campaign?.id || ""}
        onClose={() => setContactToDelete(null)}
        onSuccess={() => {
          setContactToDelete(null);
          utils.campaign.invalidate();
          if (onContactRemoved) onContactRemoved();
          router.refresh();
        }}
      />
    </div>
  );
}

interface ContactRemoveDialogProps {
  isOpen: boolean;
  contactToDelete: { id: string; name: string; email: string } | null;
  campaignId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ContactRemoveDialog({
  isOpen,
  contactToDelete,
  campaignId,
  onClose,
  onSuccess,
}: ContactRemoveDialogProps) {
  const { mutate: removeFromCampaign, isPending } =
    api.contact.removeFromCampaign.useMutation({
      onSuccess: () => {
        toast.success("Kontakt sikeresen eltávolítva a kampányból");
        onSuccess();
      },
      onError: (error) => {
        toast.error(
          error.message ||
          "Hiba történt a kampányból történő eltávolítás során",
        );
      },
    });

  const handleDelete = () => {
    if (!contactToDelete || !campaignId) return;
    removeFromCampaign({
      contactId: contactToDelete.id,
      campaignId: campaignId,
    });
  };

  if (!isOpen || !contactToDelete) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Kontakt törlése a kampányból
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block mb-2">
              Biztos, hogy el szeretnéd távolítani ezt a kontaktot a kampányból?
            </span>
            <span className="block mb-2">
              <strong>{contactToDelete.name}</strong> ({contactToDelete.email})
            </span>
            <span className="block text-destructive font-medium">
              Az eltávolítás után a kampányból több email nem kerül kiküldésre
              ennek a kapcsolatnak, és az összes jövőbeli ütemezett email
              törlésre kerül.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Mégsem</AlertDialogCancel>
          <Button onClick={handleDelete} variant="destructive" isLoading={isPending}>
            {isPending ? "Eltávolítás..." : "Eltávolítás"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
