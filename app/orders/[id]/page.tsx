import * as React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrder } from '@/lib/orders'
import { Button } from '@/components/ui/button'
import { SuccessBanner } from '@/components/success-banner'

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { success } = await searchParams

  const order = await getOrder(id)
  if (!order) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
      {success === '1' && (
        <SuccessBanner message="Order saved and finance notified." />
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            {order.projectName ?? order.companyName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {order.companyName} &middot; {order.requirementType}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            #{order.id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/orders/${id}/edit`}>Edit Order</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/orders">All Orders</Link>
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-3">
        Full order summary — coming in the next release.
      </p>
    </div>
  )
}
