"use client";
import { MY_ORDERS_QUERY_RESULT } from "@/sanity.types";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { TableBody, TableCell, TableRow } from "./ui/table";
import { Download } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { format } from "date-fns";
import PriceFormatter from "./PriceFormatter";
import { Badge } from "./ui/badge";

import OrderDetailsDialog from "./OrderDetailsDialog";
const OrdersComponent = ({ orders }: { orders: MY_ORDERS_QUERY_RESULT }) => {
  const t = useTranslations("orders");
  const tc = useTranslations("common");
  const [selectedOrder, setSelectedOrder] = useState<
    MY_ORDERS_QUERY_RESULT[number] | null
  >(null);

  return (
    <>
      <TableBody>
        <TooltipProvider>
          {orders?.map((order) => (
            <Tooltip key={order?.orderNumber}>
              <TooltipTrigger asChild>
                <TableRow
                  className=" cursor-pointer hover:bg-gray-100 h-12"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="font-medium">
                    {order.orderNumber?.slice(-10) ?? tc("na")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order?.orderDate &&
                      format(new Date(order.orderDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{order?.customerName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order?.email}
                  </TableCell>
                  <TableCell>
                    <PriceFormatter
                      amount={order?.totalPrice}
                      currency={order?.currency}
                      className="text-black font-medium"
                    />
                  </TableCell>
                  <TableCell>
                    {order?.status && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${order?.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {order?.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order?.paymentMethod === "paypal" ? (
                      <Badge variant="outline" className="text-[10px] font-normal py-0">
                        PayPal
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-normal py-0">
                        Stripe
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p>{order?.invoice?.number || "----"}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    {order?.invoice?.hosted_invoice_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (order?.invoice?.hosted_invoice_url) {
                            window.open(order.invoice.hosted_invoice_url, "_blank");
                          }
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t("invoice")}
                      </Button>
                    ) : order?.receiptUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (order?.receiptUrl) {
                            window.open(order.receiptUrl, "_blank");
                          }
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t("receipt")}
                      </Button>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-gray-400 cursor-help">
                            {tc("na")}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {order?.paymentMethod === "paypal"
                            ? t("invoiceNotPaypal")
                            : t("invoiceNotAvailable")}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              </TooltipTrigger>
              <TooltipContent>{t("clickForDetails")}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </TableBody>
      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};

export default OrdersComponent;
