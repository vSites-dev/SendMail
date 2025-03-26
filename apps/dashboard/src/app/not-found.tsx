import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRightFromSquare } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Link
        href={"/"}
        aria-label="Kezdőlap"
      >
        <Image
          src="/brand/logo.svg"
          alt="logo"
          width={140}
          height={50}
          quality={100}
        />
      </Link>
      <h2 className="mt-4 text-2xl title">
        Nem találtuk a kért oldalt
      </h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Valami hiba történt, kérjük próbáld meg újra.
      </p>
      <Link href={"/"} className="mt-2">
        <Button tabIndex={-1} className="flex gap-2" variant="link">
          Kezdőlap <ArrowUpRightFromSquare className="size-4" />
        </Button>
      </Link>
    </div>
  )
}
