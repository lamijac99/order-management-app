import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";

export default function Loading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <LinearProgress />
    </Container>
  );
}