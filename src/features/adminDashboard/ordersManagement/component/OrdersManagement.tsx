"use client";

import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  CheckSquare,
  Hourglass,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders, useDeleteOrder } from "../hooks/useOrdersManagement";
import type { Order, OrdersParams } from "../types/ordersManagement.types";

const ITEMS_PER_PAGE = 10;

const statusStyles: Record<string, string> = {
  paid: "bg-[rgba(19,236,91,0.2)] text-[#004242]",
  pending: "bg-[#fef3c7] text-[#b45309]",
  cancelled: "bg-[#fee2e2] text-[#dc2626]",
};

const getCustomerName = (order: Order) => {
  const fullName = [order.userId?.firstName, order.userId?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || order.userId?.email || "Deleted customer";
};

const getCustomerEmail = (order: Order) => {
  return order.userId?.email || "No email available";
};

const getItemTitle = (item: Order["items"][number]) => {
  if (item.productType === "ebook") {
    return item.ebook?.title || "Deleted e-book";
  }

  return item.book?.title || "Deleted book";
};

export default function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] =
    useState<OrdersParams["paymentStatus"]>("all");

  const { data, isLoading } = useOrders({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchQuery || undefined,
    paymentStatus: statusFilter,
    sort: "descending",
  });

  const { mutate: removeOrder, isPending: isDeleting } = useDeleteOrder();

  const handleDelete = (orderId: string) => {
    removeOrder(orderId);
  };

  const orders = data?.data?.data || [];
  const meta = data?.data?.meta;
  const totalOrders = meta?.total || 0;
  const totalPages = meta?.totalPage || 1;
  const paidCount = orders.filter((o) => o.paymentStatus === "paid").length;
  const pendingCount = orders.filter(
    (o) => o.paymentStatus === "pending",
  ).length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = [
    { label: "Total Orders", value: String(totalOrders), icon: TrendingUp },
    {
      label: "Page Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
    },
    { label: "Paid (this page)", value: String(paidCount), icon: CheckSquare },
    {
      label: "Pending (this page)",
      value: String(pendingCount),
      icon: Hourglass,
    },
  ];

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-4 rounded-2xl border border-[#e3eeee] bg-white p-6 shadow-sm"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#f0f9f8]">
              <stat.icon className="size-5 text-[#5f7d7d]" />
            </div>
            <div>
              <p className="text-sm text-[#5f7d7d]">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-[#0f172a]">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                ) : (
                  stat.value
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table Card */}
      <div className="rounded-lg border border-[#cecece] bg-white p-6">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#181919]">
              Orders Management
            </h1>
            <div className="mt-3 flex items-center gap-2 text-base text-[#6c6c6c]">
              <span className="font-medium">Dashboard</span>
              <ChevronRight className="size-4" />
              <span className="font-medium">Orders Management</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex h-[52px] w-full sm:w-[400px]">
              <input
                type="text"
                placeholder="Search by email, order ID, or PayPal ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-l-lg border border-[#727272] px-4 text-base text-[#3b3b3b] placeholder:text-[#6c6c6c] focus:border-[#4f46e5] focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="flex w-[60px] items-center justify-center rounded-r-lg bg-[#4f46e5]"
              >
                <Search className="size-5 text-white" />
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(["all", "paid", "pending", "cancelled"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                      statusFilter === status
                        ? "bg-[#4f46e5] text-white"
                        : "border border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5]/5",
                    )}
                  >
                    {status}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f46e5]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-[#6c6c6c]">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border border-[#e4e4e4] bg-white">
                  <th className="px-4 py-4 text-left text-base font-bold text-black">
                    Order ID
                  </th>
                  <th className="px-4 py-4 text-left text-base font-bold text-black">
                    Customer
                  </th>
                  <th className="px-4 py-4 text-left text-base font-bold text-black">
                    Items
                  </th>
                  <th className="px-4 py-4 text-center text-base font-bold text-black">
                    Total
                  </th>
                  <th className="px-4 py-4 text-center text-base font-bold text-black">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center text-base font-bold text-black">
                    Date
                  </th>
                  <th className="px-4 py-4 text-center text-base font-bold text-black">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: Order) => (
                  <tr key={order._id} className="border border-[#e4e4e4]">
                    <td className="px-4 py-4 text-sm font-medium text-[#0f172a]">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-[#0f172a]">
                        {getCustomerName(order)}
                      </p>
                      <p className="text-xs text-[#6c6c6c]">
                        {getCustomerEmail(order)}
                      </p>
                      {order.paypalOrderId && (
                        <p className="mt-1 font-mono text-[11px] text-[#6c6c6c]">
                          {order.paypalOrderId}
                        </p>
                      )}
                    </td>
                    <td className="max-w-[250px] px-4 py-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-[#0f172a]">
                          {getItemTitle(item)}{" "}
                          <span className="text-xs text-[#6c6c6c]">
                            x{item.quantity}
                          </span>
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                            {item.productType}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-4 text-center text-base font-medium text-[#111]">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={cn(
                          "inline-block rounded-full px-3 py-1 text-xs font-bold capitalize",
                          statusStyles[order.paymentStatus],
                        )}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-[#3b3b3b]">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDelete(order._id)}
                        disabled={isDeleting}
                        className="rounded-full p-2 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete Order"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-5 sm:px-12">
              <p className="text-sm text-[#3b3b3b]">
                Page {meta?.page || 1} of {totalPages} ({totalOrders} results)
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex size-10 items-center justify-center rounded border border-[#64748b] bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="size-[18px]" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "flex size-10 items-center justify-center rounded text-base font-medium",
                        currentPage === pageNum
                          ? "bg-[#4f46e5] text-white"
                          : "border border-[#0f172a] text-[#0f172a]",
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex size-10 items-center justify-center rounded border border-[#0f172a] disabled:opacity-40"
                >
                  <ChevronRight className="size-[18px]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
