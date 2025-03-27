"use client"

import { badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAtom } from "jotai"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { onboardingProjectNameAtom } from "@/store/global"
import { Input } from "@/components/ui/input"

export default function OnboardingStepOne() {
  const router = useRouter()

  const [projectName, setProjectName] = useAtom(onboardingProjectNameAtom)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      console.log("Form submitted:", projectName)
      router.push("/uj-projekt/2")
    }, 400)
  }

  return (
    <main className="mx-auto p-4">
      <div
        style={{ animationDuration: "500ms" }}
        className="motion-safe:animate-revealBottom"
      >
        <h1 className="title text-2xl font-semibold sm:text-xl dark:text-gray-50">
          Projekt adatai
        </h1>
        <p className="mt-6 text-gray-700 sm:text-sm dark:text-gray-300">
          A projekt alapvető adatai szükségesek a későbbi beazonosításhoz.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <p className="mb-2">
              Projekt neve
            </p>
            <Input placeholder="LeoAI..." value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </div>

          <div className="mt-8 flex justify-end border-t pt-8">
            <Button
              className="disabled:bg-gray-200 disabled:text-gray-500"
              type="submit"
              disabled={loading}
              aria-disabled={loading}
              isLoading={loading}
            >
              Következő
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
