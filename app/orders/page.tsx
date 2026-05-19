import * as React from 'react';
import Link from 'next/link';
import { listOrders } from '@/lib/orders';
import { Button } from '@/components/ui/button';
import { OrdersSearch } from '@/components/orders-search';
import { OrdersTable } from '@/components/orders-table';
import { OrderCard } from '@/components/order-card';
import { SuccessBanner } from '@/components/success-banner';
import { Plus } from 'lucide-react';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q, success } = await searchParams;
  const query = typeof q === 'string' ? q : undefined;
  const orders = await listOrders(query);

  return (
    <div className="p-6 space-y-6">
      {success === '1' && (
        <SuccessBanner message="Order saved and finance notified." />
      )}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Orders</h1>
        <Button asChild className="w-auto h-11">
          <Link href="/orders/new">
            <Plus />
            New Order
          </Link>
        </Button>
      </div>

      <React.Suspense>
        <OrdersSearch defaultValue={query} />
      </React.Suspense>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-muted-foreground text-sm">
            {query ? 'No orders match your search.' : 'No orders yet.'}
          </p>
          {!query && (
            <Button asChild>
              <Link href="/orders/new">Create your first order</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 md:hidden">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <div className="hidden md:block">
            <OrdersTable orders={orders} />
          </div>
        </>
      )}
    </div>
  );
}
