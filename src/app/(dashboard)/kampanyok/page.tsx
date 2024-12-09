import DashboardHeader from '@/components/layouts/dashboard-header'
import { BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { HydrateClient } from '@/trpc/server'

export default function Kampanyok() {
  return (
    <HydrateClient>
      <DashboardHeader>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Vezérlőpult</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Kampányok</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="flex flex-col py-8 px-4 md:px-8 relative mx-auto space-y-6 container">
        <h1 className='text-2xl font-semibold'>Kampányok kezelése</h1>
      </main>
    </HydrateClient>
  )
}
