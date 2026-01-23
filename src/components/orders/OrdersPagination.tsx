"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@mui/material/Pagination";

export default function OrdersPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const sp = useSearchParams();

  return (
    <Pagination
      page={Math.min(Math.max(page, 1), totalPages)}
      count={totalPages}
      color="primary"
      onChange={(_, nextPage) => {
        const p = new URLSearchParams(sp.toString());
        p.set("page", String(nextPage));
        router.push(`/orders?${p.toString()}`);
      }}
    />
  );
}
