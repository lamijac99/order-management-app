import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

export default function TopProducts({
  items,
}: {
  items: Array<{ naziv: string; count: number; komada: number }>;
}) {
  if (!items.length) return <div>Nema podataka.</div>;

  return (
    <List dense>
      {items.map((p, idx) => (
        <div key={p.naziv + idx}>
          <ListItem
            secondaryAction={<b>{p.count}</b>}
            sx={{ py: 0.5 }}
          >
            <ListItemText primary={p.naziv} secondary={`Broj narudžbi: ${p.count}`} />
          </ListItem>
          {idx !== items.length - 1 && <Divider />}
        </div>
      ))}
    </List>
  );
}
