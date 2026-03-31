import { Box, CircularProgress } from "@mui/material";

const FullScreenLoader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
    }}
  >
    <CircularProgress size={60} />
  </Box>
);

export default FullScreenLoader;