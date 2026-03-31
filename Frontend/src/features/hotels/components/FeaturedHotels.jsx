import React from 'react'
import { hotelApi } from '../api/hotelApi'
import { useQuery } from '@tanstack/react-query'
import FullScreenLoader from '../../../components/ui/FullScreenLoader'

const FeaturedHotels = () => {

  const { data: hotels = [], isLoading, isError} = useQuery({
    queryKey:["hotels"],
    queryFn: hotelApi.getAllHotels,
  });

  if(isLoading) return <FullScreenLoader />;
  if(isError) return <p>Error fetching hotels</p>
  if(hotels.length === 0) return <p>No hotels found</p>

  return (
    <>
      <ul>
        {hotels.map((hotel) => (
          <li key={hotel._id || hotel.id }>{hotel.hotelName}</li>
        ))}
      </ul>
    </>
  )
}

export default FeaturedHotels
