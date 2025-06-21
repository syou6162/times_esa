import React, { memo } from 'react';
import { Box, IconButton, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export type MobileHamburgerMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export const MobileHamburgerMenu: React.FC<MobileHamburgerMenuProps> = memo(({
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <>
      {/* ハンバーガーメニューボタン */}
      <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1000 }}>
        <IconButton
          onClick={onToggle}
          sx={{ 
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            }
          }}
          aria-label="メニューを開く"
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* ドロワー */}
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={onToggle}
        PaperProps={{
          sx: {
            '& ::-webkit-scrollbar': {
              width: '8px',
            },
            '& ::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px',
            },
            '& ::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
              },
            },
          }
        }}
      >
        {children}
      </Drawer>
    </>
  );
});

MobileHamburgerMenu.displayName = 'MobileHamburgerMenu';

export default MobileHamburgerMenu;