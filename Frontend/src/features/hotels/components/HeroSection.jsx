import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import heroImg from "../../../assets/HomePage/heroImg.png";

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

  const handleSearch = () => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v.trim() !== ""),
    );

    const query = new URLSearchParams(cleaned).toString();
    navigate(`/hotels?${query}`);
  };

  const fieldStyle = {
    flex: "1 1 0",
    minWidth: "120px",
    padding: "12px 16px",
    borderRight: "1px solid #eee",
    display: "flex",
    flexDirection: "column",
  };

  const labelStyle = {
    fontSize: "10px",
    fontWeight: 600,
    color: "#888",
    marginBottom: "4px",
  };

  const inputStyle = {
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#1A2B44",
    background: "transparent",
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        height: "90vh",
        backgroundImage: `url(${heroImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 🔥 DARK OVERLAY */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.6))",
          zIndex: 1,
        }}
      />

      {/* CONTENT */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          color: "white",
          maxWidth: "800px",
          px: 2,
        }}
      >
        {/* HEADLINE */}
        <Typography
          sx={{
            fontFamily: "Libre Baskerville",
            fontSize: { xs: "48px", md: "75px" },
            fontWeight: 400,
            lineHeight: 0.4,
          }}
        >
          Find your perfect stay
        </Typography>

        <Typography
          sx={{
            fontFamily: "EB Garamond",
            fontSize: { xs: "48px", md: "75px" },
            fontStyle: "italic",
            mb: 1,
          }}
        >
          anywhere in the world
        </Typography>

        {/* SUBTEXT */}
        <Typography
          sx={{
            fontSize: "14px",
            opacity: 0.8,
            mb: 5,
          }}
        >
          Curated architectural wonders and boutique havens for the discerning
          traveler.
        </Typography>

        {/* 🔥 SEARCH BAR (MAIN COMPONENT) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
            width: "100%",
            margin: "0 auto",
            height: "80px",
          }}
        >
          {/* Country */}
          <Box sx={fieldStyle}>
            <p style={labelStyle}>COUNTRY</p>
            <input
              name="country"
              placeholder="Country"
              value={filters.country}
              onChange={handleChange}
              style={inputStyle}
              onKeyDown={handleKeyDown}
            />
          </Box>

          {/* City */}
          <Box sx={fieldStyle}>
            <p style={labelStyle}>City</p>
            <input
              name="city"
              placeholder="City"
              value={filters.city}
              onChange={handleChange}
              style={inputStyle}
              onKeyDown={handleKeyDown}
            />
          </Box>

          {/* Search */}
          <Box sx={fieldStyle}>
            <p style={labelStyle}>Search</p>
            <input
              name="search"
              placeholder="Search hotels"
              value={filters.search}
              onChange={handleChange}
              style={inputStyle}
              onKeyDown={handleKeyDown}
            />
          </Box>

          {/* Amenities */}
          <Box sx={fieldStyle}>
            <p style={labelStyle}>Amenities</p>
            <input
              name="amenities"
              placeholder="Amenities"
              value={filters.amenities}
              onChange={handleChange}
              style={inputStyle}
              onKeyDown={handleKeyDown}
            />
          </Box>

          {/* BUTTON */}
          <Button
            onClick={handleSearch}
            sx={{
              backgroundColor: "#C5A059",
              color: "#000",
              px: 5,
              minWidth: "130px",
              flexShrink: 0,
              height: "100%",
              borderRadius: 0,
              fontWeight: 500,
              letterSpacing: "1px",
              "&:hover": {
                backgroundColor: "#b8954d",
              },
            }}
          >
            SEARCH
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSection;
