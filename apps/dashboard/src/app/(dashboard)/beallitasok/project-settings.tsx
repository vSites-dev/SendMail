"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function ProjectSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projekt beállítások</CardTitle>
        <CardDescription>
          Itt kezelheted az aktuális projekt beállításait és tulajdonságait.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 py-6">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Projekt beállítások hamarosan</h3>
            <p className="text-muted-foreground">
              Ezen a fülön a jövőben elérhetővé válnak a projekt beállítások, amelyekkel testre szabhatod a SendMail projekt működését.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="text-sm text-muted-foreground">A projekt beállítások jelenleg nem érhetők el.</p>
      </CardFooter>
    </Card>
  )
}
