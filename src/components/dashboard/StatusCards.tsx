import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

type OrderStatus = "KREIRANA" | "U_OBRADI" | "POSLATA" | "ISPORUCENA" | "OTKAZANA";

function color(status: string) {
  switch (status) {
    case "KREIRANA":
      return { bg: "#e3f2fd", fg: "#0d47a1" };
    case "U_OBRADI":
      return { bg: "#fff8e1", fg: "#e65100" };
    case "POSLATA":
      return { bg: "#e8f5e9", fg: "#1b5e20" };
    case "ISPORUCENA":
      return { bg: "#ede7f6", fg: "#311b92" };
    case "OTKAZANA":
      return { bg: "#ffebee", fg: "#b71c1c" };
    default:
      return { bg: "#f5f5f5", fg: "#111" };
  }
}

export default function StatusCards({
  totalAll,
  countsByStatus,
}: {
  totalAll: number;
  countsByStatus: Record<OrderStatus, number>;
}) {
  const items: Array<{ label: string; value: number }> = [
    { label: "UKUPNO", value: totalAll },
    { label: "KREIRANA", value: countsByStatus.KREIRANA },
    { label: "U_OBRADI", value: countsByStatus.U_OBRADI },
    { label: "POSLATA", value: countsByStatus.POSLATA },
    { label: "ISPORUCENA", value: countsByStatus.ISPORUCENA },
    { label: "OTKAZANA", value: countsByStatus.OTKAZANA },
  ];

  return (
    <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 2,
      justifyContent: "center",
    }}
  >
  
      {items.map((x) => {
        const c = color(x.label);
        return (
          <Paper key={x.label} elevation={3} sx={{ p: 1, borderRadius: 2, bgcolor: c.bg }}>
            <Typography variant="body2" sx={{ color: c.fg, fontWeight: 700, fontSize: 12 }}>
              {x.label}
            </Typography>
            <Typography variant="h6" sx={{ color: c.fg, fontWeight: 800, textAlign: "center", fontSize: 18 }}>
              {x.value}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}
