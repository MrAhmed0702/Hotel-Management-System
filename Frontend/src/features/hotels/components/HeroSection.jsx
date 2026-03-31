import React, { useState } from "react";
import { hotelApi } from "../api/hotelApi";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Container,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    amenities: "",
    search: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async () => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v.trim() !== ""),
    );

    const query = new URLSearchParams(cleaned).toString();

    navigate(`/hotels?${query}`);
  };

  return (
    <Box
      sx={{
        py: 10,
        color: "white",
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          fontWeight="bold"
          color="text.primary"
          gutterBottom
        >
          Find Your Perfect Stay
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Discover luxury, comfort, and unique experiences worldwide.
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="City"
            name="city"
            value={filters.city}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Country"
            name="country"
            value={filters.country}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Search (luxury, beach...)"
            name="search"
            value={filters.search}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Amenities (comma separated)"
            name="amenities"
            value={filters.amenities}
            onChange={handleChange}
            fullWidth
          />

          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={false}
          >
            Search Hotels
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default HeroSection;
