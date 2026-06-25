import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, actions, maxWidth = "sm", fullWidth = true }) {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth={maxWidth} 
      fullWidth={fullWidth}
      PaperProps={{
        sx: { 
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' 
        }
      }}
    >
      <DialogTitle sx={{ 
          m: 0, 
          p: 3, 
          pb: 2, 
          color: '#04162E', 
          fontWeight: 600, 
          fontFamily: 'var(--font-heading)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
        {title}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: '#717378',
              '&:hover': { backgroundColor: '#F8F6F2' }
            }}
          >
            <X size={20} />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3, borderColor: '#EEEEEE' }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ p: 3, pt: 2 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
