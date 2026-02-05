"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const PAGE_SIZES = [10, 20, 50, 100] as const;

export default function OrdersPagination({
  page,
  totalPages,
  pageSize,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const clampedPage = Math.min(Math.max(page, 1), totalPages);
  const size = PAGE_SIZES.includes(pageSize as any) ? pageSize : 10;

  const pushWith = (next: { page?: number; pageSize?: number }) => {
    const p = new URLSearchParams(sp.toString());

    if (next.pageSize !== undefined) p.set("pageSize", String(next.pageSize));
    if (next.page !== undefined) p.set("page", String(next.page));

    router.push(`/orders?${p.toString()}`);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        
        <Select
          value={size}
          onChange={(e) => {
            const nextSize = Number(e.target.value);
            pushWith({ pageSize: nextSize, page: 1 });
          }}
        >
          {PAGE_SIZES.map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Pagination
        page={clampedPage}
        count={totalPages}
        color="primary"
        onChange={(_, nextPage) => pushWith({ page: nextPage })}
      />
    </Box>
  );
}