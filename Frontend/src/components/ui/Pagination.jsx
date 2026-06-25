import { Pagination as MuiPagination } from '@mui/material';

export default function Pagination({ count, page, onChange, className }) {
  if (!count || count <= 1) return null;
  
  return (
    <div className={`flex justify-center mt-6 ${className || ''}`}>
      <MuiPagination 
        count={count} 
        page={page} 
        onChange={(_, newPage) => onChange(newPage)} 
        color="primary" 
        sx={{
          '& .MuiPaginationItem-root': {
            color: '#1A2B44',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: '#04162E',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#0B2545',
            }
          }
        }}
      />
    </div>
  );
}
