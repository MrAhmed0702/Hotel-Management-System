import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const FiltersSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries([...searchParams]);
  const [localFilters, setLocalFilters] = useState({
    city: filters.city || "",
    country: filters.country || "",
  });

  const handleChange = (key, value) => {
    const updated = {
      ...filters,
      [key]: value,
    };

    setSearchParams(updated);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const handleAmenityChange = (value, checked) => {
    let current = filters.amenities ? filters.amenities.split(",") : [];

    if (checked) {
      current.push(value);
    } else {
      current = current.filter((item) => item !== value);
    }

    handleChange("amenities", current.join(","));
  };

  return (
    <Box sx={{ width: 250, p: 2, borderRight: "1px solid #eee" }}>
      <Typography variant="h6" mb={2}>
        Filters
      </Typography>

      <Stack spacing={2}>
        {/* City */}
        <TextField
          label="City"
          value={localFilters.city}
          onChange={(e) =>
            setLocalFilters((prev) => ({
              ...prev,
              city: e.target.value,
            }))
          }
        />

        {/* Country */}
        <TextField
          label="Country"
          value={localFilters.country}
          onChange={(e) => {
            setLocalFilters((prev) => ({
                ...prev,
                country: e.target.value,
            }))
          }}
        />

        {/* Amenities */}
        {["wifi", "pool", "spa"].map((item) => (
          <FormControlLabel
            key={item}
            control={
              <Checkbox
                checked={filters.amenities?.split(",").includes(item)}
                onChange={(e) => handleAmenityChange(item, e.target.checked)}
              />
            }
            label={item.toUpperCase()}
          />
        ))}

        <Button
          variant="contained"
          onClick={() => {
            setSearchParams({
              ...filters,
              ...localFilters,
            });
          }}
        >
          Apply Filters
        </Button>

        {/* Clear */}
        <Button variant="outlined" onClick={clearFilters}>
          Clear Filters
        </Button>
      </Stack>
    </Box>
  );
};

export default FiltersSidebar;
