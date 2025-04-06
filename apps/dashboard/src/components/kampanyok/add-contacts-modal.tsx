"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Search, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { Contact } from "@prisma/client";

interface AddContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

export function AddContactsModal({
  isOpen,
  onClose,
  campaignId,
}: AddContactsModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const router = useRouter();

  const { data: contacts, isLoading: isLoadingContacts } = api.contact.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { data: campaign } = api.campaign.getById.useQuery({ 
    id: campaignId 
  }, {
    refetchOnWindowFocus: false,
  });

  // Filter out contacts that are already in the campaign
  const availableContacts = contacts?.filter(
    (contact) => !campaign?.contacts.some((c) => c.id === contact.id)
  ) || [];

  // Filter contacts based on search term
  const filteredContacts = availableContacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { mutate: updateCampaign, isPending } = api.campaign.addContactsWithEmails.useMutation({
    onSuccess: () => {
      toast.success("Kontaktok sikeresen hozzáadva a kampányhoz");
      onClose();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Hiba történt a kontaktok hozzáadása során");
    },
  });

  useEffect(() => {
    setIsMounted(true);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map((contact) => contact.id));
    }
  };

  const handleSubmit = () => {
    if (selectedContacts.length === 0) {
      toast.error("Válassz ki legalább egy kontaktot");
      return;
    }

    updateCampaign({
      campaignId,
      contactIds: selectedContacts,
    });
  };

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      <Card
        ref={modalRef}
        className="relative w-[95%] max-w-3xl max-h-[85vh] flex flex-col overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-300"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Bezárás</span>
            </Button>
            <Badge className="text-muted-foreground" variant="outline">ESC</Badge>
          </div>
          <div className="mx-auto flex items-center">
            <h2 id="modal-title" className="text-xl font-semibold">
              Kontaktok hozzáadása a kampányhoz
            </h2>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Keresés név vagy email alapján..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoadingContacts ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Nincs találat a keresési feltételekre"
                  : "Nincsenek elérhető kontaktok a hozzáadáshoz"}
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedContacts.length > 0 &&
                          selectedContacts.length === filteredContacts.length
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Név</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Létrehozva</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => handleSelectContact(contact.id)}
                          aria-label={`Select ${contact.name || contact.email}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {contact.name || "Névtelen"}
                      </TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              {selectedContacts.length} kiválasztott kontakt
            </div>
          </div>
        </div>

        <div className="border-t p-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="mr-2"
          >
            Mégsem
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedContacts.length === 0 || isPending}
            className="flex items-center gap-2"
            isLoading={isPending}
          >
            {!isPending && <Check className="h-4 w-4" />}
            Hozzáadás
          </Button>
        </div>
      </Card>
    </div>,
    document.body
  );
}
