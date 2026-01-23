"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Box, Button, TextField, Typography, MenuItem } from "@mui/material";
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
}: {
  proizvodi: Proizvod[];
  isAdmin: boolean;
  users: UserOption[];
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  useEffect(() => {
    if (!selectedProductId) return;
    const price = priceById.get(selectedProductId);
    if (price === undefined) return;
    setValue("cijena_po_komadu", price, { shouldValidate: true, shouldDirty: true });
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
    setTimeout(() => {
      window.location.href = "/orders";
    }, 600);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 520, mx: "auto", display: "grid", gap: 2 }}
    >
      <Typography variant="h5">Nova narudžba</Typography>

      {isAdmin && (
        <TextField
          select
          size="medium"
          label="Kupac"
          value={watch("korisnik_id") ?? ""}
          {...register("korisnik_id", {
            required: "Kupac je obavezan (admin).",
          })}
          error={!!errors.korisnik_id}
          helperText={errors.korisnik_id?.message}
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
        SelectProps={{ native: true }}
        {...register("proizvod_id", { required: "Proizvod je obavezan" })}
        error={!!errors.proizvod_id}
        helperText={errors.proizvod_id?.message}
      >
        <option value=""></option>
        {proizvodi.map((p) => (
          <option key={p.id} value={p.id}>
            {p.naziv}
          </option>
        ))}
      </TextField>

      <TextField
        label="Količina"
        type="number"
        {...register("kolicina", {
          required: "Količina je obavezna",
          valueAsNumber: true,
          min: { value: 1, message: "Količina mora biti najmanje 1" },
          validate: (v) => (Number.isInteger(v) ? true : "Količina mora biti cijeli broj"),
        })}
        error={!!errors.kolicina}
        helperText={errors.kolicina?.message}
      />

      <TextField
        label="Cijena po komadu"
        type="number"
        InputProps={{ readOnly: true }}
        {...register("cijena_po_komadu", { valueAsNumber: true })}
      />

      <TextField
        label="Adresa isporuke"
        {...register("adresa_isporuke", {
          required: "Adresa isporuke je obavezna",
          minLength: { value: 5, message: "Adresa isporuke je prekratka" },
        })}
        error={!!errors.adresa_isporuke}
        helperText={errors.adresa_isporuke?.message}
      />

      <Button type="submit" variant="contained" disabled={isSubmitting}>
        Kreiraj narudžbu
      </Button>
    </Box>
  );
}
