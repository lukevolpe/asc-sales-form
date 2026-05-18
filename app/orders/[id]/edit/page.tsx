import { notFound } from "next/navigation"
import { getOrder } from "@/lib/orders"
import { EditOrderForm } from "@/components/order-form"

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  return <EditOrderForm orderId={id} order={order} />
}
