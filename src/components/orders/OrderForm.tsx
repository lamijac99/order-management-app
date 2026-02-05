"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Box, Button, TextField, MenuItem } from "@mui/material";
import { createOrderAction } from "@/app/orders/new/actions/action";

type Proizvod = { id: string; naziv: string; cijena: number };
type UserOption = { id: string; ime: string; email: string };

type FormData = {
  proizvod_id: string;
  kolicina: number;
  cijena_po_komadu: number;
  adresa_isporuke: string;
  korisnik_id?: string;
};

export default function OrderForm({
  proizvodi,
  isAdmin,
  users,
  onSuccess,
}: {
  proizvodi: Proizvod[];
  isAdmin: boolean;
  users: UserOption[];
  onSuccess?: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      proizvod_id: "",
      kolicina: 1,
      cijena_po_komadu: 0,
      adresa_isporuke: "",
      korisnik_id: "",
    },
  });

  const priceById = useMemo(() => {
    const m = new Map<string, number>();
    proizvodi.forEach((p) => m.set(p.id, Number(p.cijena ?? 0)));
    return m;
  }, [proizvodi]);

  const selectedProductId = watch("proizvod_id");
  const selectedUserId = watch("korisnik_id");

  useEffect(() => {
    if (!selectedProductId) {
      setValue("cijena_po_komadu", 0, { shouldValidate: true, shouldDirty: true });
      return;
    }
    const price = priceById.get(selectedProductId);
    setValue("cijena_po_komadu", Number(price ?? 0), { shouldValidate: true, shouldDirty: true });
  }, [selectedProductId, priceById, setValue]);

  const onSubmit = async (data: FormData) => {
    const res = await createOrderAction({
      proizvod_id: data.proizvod_id,
      kolicina: data.kolicina,
      adresa_isporuke: data.adresa_isporuke,
      korisnik_id: isAdmin ? String(data.korisnik_id ?? "").trim() : undefined,
    });

    if (!res.ok) {
      toast.error(res.error || "Upis nije uspio.");
      return;
    }

    toast.success("Narudžba je uspješno kreirana!");
    reset();
    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 300);
    } else {
      setTimeout(() => {
        window.location.href = "/orders";
      }, 600);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "grid", gap: 2, mt: 1 }}
    >
      {isAdmin && (
        <TextField
          select
          label="Kupac"
          size="medium"
          value={selectedUserId ?? ""}
          error={!!errors.korisnik_id}
          helperText={errors.korisnik_id?.message}
          {...register("korisnik_id", {
            validate: (v) => {
              const val = String(v ?? "").trim();
              if (!val) return "Kupac je obavezan (admin).";
              const exists = users.some((u) => u.id === val);
              return exists ? true : "Izabrani kupac nije validan.";
            },
          })}
        >
          <MenuItem value="">
            <em>Izaberi kupca</em>
          </MenuItem>

          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.ime} ({u.email})
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        select
        label="Proizvod"
        value={selectedProductId ?? ""}
        error={!!errors.proizvod_id}
        helperText={errors.proizvod_id?.message}
        {...register("proizvod_id", { required: "Proizvod je obavezan" })}
      >
        <MenuItem value="">
          <em>Izaberi proizvod</em>
        </MenuItem>

        {proizvodi.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.naziv}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Količina"
        type="number"
        error={!!errors.kolicina}
        helperText={errors.kolicina?.message}
        {...register("kolicina", {
          required: "Količina je obavezna",
          valueAsNumber: true,
          min: { value: 1, message: "Količina mora biti najmanje 1" },
          validate: (v) => (Number.isInteger(v) ? true : "Količina mora biti cijeli broj"),
        })}
      />

      <TextField
        label="Cijena po komadu"
        type="number"
        disabled
        {...register("cijena_po_komadu", { valueAsNumber: true })}
      />

      <TextField
        label="Adresa isporuke"
        error={!!errors.adresa_isporuke}
        helperText={errors.adresa_isporuke?.message}
        {...register("adresa_isporuke", {
          required: "Adresa isporuke je obavezna",
          minLength: { value: 5, message: "Adresa isporuke je prekratka" },
        })}
      />

      <Button type="submit" variant="contained" disabled={isSubmitting}>
        Kreiraj narudžbu
      </Button>
    </Box>
  );
}
