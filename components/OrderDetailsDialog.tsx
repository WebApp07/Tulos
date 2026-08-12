import { MY_ORDERS_QUERY_RESULT } from "@/sanity.types";
import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Download, Printer } from "lucide-react";
import PriceFormatter from "./PriceFormatter";

interface Props {
  order: MY_ORDERS_QUERY_RESULT[number] | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsDialog: FC<Props> = async ({ order, isOpen, onClose }) => {
  const t = await getTranslations("orders");
  const tc = await getTranslations("common");
  if (!order) return null;
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>
            {t("orderDetails", { orderNumber: order?.orderNumber ?? "" })}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-1">
          <p>
            <strong>{t("customer")}:</strong> {order?.customerName}
          </p>
          <p>
            <strong>{t("email")}:</strong> {order?.email}
          </p>
          <p>
            <strong>{t("date")}:</strong>{" "}
            {order?.orderDate &&
              new Date(order?.orderDate).toLocaleDateString()}
          </p>
          <p>
            <strong>{t("status")}:</strong>{" "}
            <span className="capitalize text-green-600 font-medium">
              {order?.status}
            </span>
          </p>
          <p>
            <strong>{t("paymentMethod")}:</strong>{" "}
            <span className="capitalize">{order?.paymentMethod || "Stripe"}</span>
          </p>
          <p>
            <strong>{t("invoiceNumber")}:</strong>{" "}
            {order?.invoice?.number || tc("na")}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {order?.invoice?.hosted_invoice_url ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={order?.invoice?.hosted_invoice_url}
                  target="blank"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t("downloadInvoice")}
                </Link>
              </Button>
            ) : order?.receiptUrl ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={order?.receiptUrl}
                  target="blank"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t("downloadReceipt")}
                </Link>
              </Button>
            ) : (
              order?.paymentMethod === "paypal" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2 print:hidden"
                >
                  <Printer className="h-4 w-4" />
                  {t("printReceipt")}
                </Button>
              )
            )}
          </div>
          {!order?.invoice?.hosted_invoice_url && !order?.receiptUrl && (
            <p className="text-sm text-gray-500 mt-2 italic print:hidden">
              {order?.paymentMethod === "paypal"
                ? t("invoiceNotePaypal")
                : t("invoiceNote")}
            </p>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("product")}</TableHead>
              <TableHead>{t("quantity")}</TableHead>
              <TableHead>{t("price")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order?.products?.map((product, index) => (
              <TableRow key={index}>
                <TableCell className="flex items-center gap-2">
                  {product?.product?.images && (
                    <Image
                      src={urlFor(product?.product?.images[0]).url()}
                      alt="productImage"
                      width={50}
                      height={50}
                      className="border rounded-sm w-14 h-14 object-contain"
                    />
                  )}
                  {product?.product && (
                    <p className=" line-clamp-1">{product?.product?.name}</p>
                  )}
                </TableCell>
                <TableCell>{product?.quantity}</TableCell>
                {product?.product?.price && product?.quantity && (
                  <TableCell>
                    <PriceFormatter
                      className="text-black font-medium"
                      amount={product?.product?.price * product?.quantity}
                      currency={order?.currency}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 text-right flex items-center justify-end">
          <div className="w-44 flex flex-col gap-1">
            {order?.amountDiscount !== 0 && (
              <div className="w-full flex items-center justify-between">
                <strong>{tc("subtotal")}</strong>
                <PriceFormatter
                  amount={
                    (order?.totalPrice as number) +
                    (order?.amountDiscount as number)
                  }
                  currency={order?.currency}
                />
              </div>
            )}
            {order?.amountDiscount !== 0 && (
              <div className="w-full flex items-center justify-between">
                <strong>{tc("discount")}</strong>
                <PriceFormatter
                  amount={order?.amountDiscount}
                  currency={order?.currency}
                />
              </div>
            )}

            <div className="w-full flex items-center justify-between">
              <strong>{t("total")}:</strong>
              <PriceFormatter
                amount={order?.totalPrice}
                currency={order?.currency}
                className="text-black font-bold"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
