import Container from "@/components/Container";
import OrdersComponent from "@/components/OrdersComponent";
import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMyOrders } from "@/sanity/helpers/queries";
import { auth } from "@clerk/nextjs/server";
import { FileX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import React from "react";

const OrdersPage = async () => {
  const t = await getTranslations("orders");
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const orders = await getMyOrders(userId);

  return (
    <Container className="py-10">
      {orders?.length ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-auto">{t("orderNumber")}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("date")}</TableHead>
                    <TableHead>{t("customer")}</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      {t("email")}
                    </TableHead>
                    <TableHead>{t("total")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      {t("method")}
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      {t("invoiceNumber")}
                    </TableHead>
                    <TableHead className="text-right">{t("action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <OrdersComponent orders={orders} />
                <ScrollBar orientation="horizontal" />
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-5 md:py-10 px-4">
          <FileX className="h-24 w-24 text-gray-400 mb-4" />
          <Title>{t("noOrders")}</Title>
          <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
            {t("noOrdersDesc")}
          </p>
          <Button asChild className="mt-6">
            <Link href={"/"}>{t("browseProducts")}</Link>
          </Button>
        </div>
      )}
    </Container>
  );
};

export default OrdersPage;
