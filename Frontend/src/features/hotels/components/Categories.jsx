import React from 'react'

const Categories = () => {

  let categories = ["Luxary Stays", "Budget Stays", "Villas", "Business", "Family Friendly"];

  return (
    <div className='w-full h-30 bg-[#f5f3f5] flex items-center justify-center gap-4 px-4 py-2'>
      {
        categories.map((category, index) => (
          <button key={index} className='bg-[#ffffff] px-5 py-3 rounded-md uppercase text-sm text-[#717378] active:bg-[#04162e] active:text-white transition duration-300 cursor-pointer'>
            {category}
          </button>
        ))
      }
    </div>
  )
}

export default Categories
