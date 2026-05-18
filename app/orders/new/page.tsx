"use client"

import { useRouter } from "next/navigation"
import { OrderForm, NEW_ORDER_DEFAULTS } from "@/components/order-form"
import { createOrder } from "@/app/actions/orders"

export default function NewOrderPage() {
  const router = useRouter()
  return (
    <OrderForm
      defaultValues={NEW_ORDER_DEFAULTS}
      submitAction={createOrder}
      onSuccess={() => router.push(`/orders?success=1`)}
      pageTitle="New Order"
    />
  )
}
