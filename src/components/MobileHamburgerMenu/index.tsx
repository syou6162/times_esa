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
      >
        {children}
      </Drawer>
    </>
  );
});

MobileHamburgerMenu.displayName = 'MobileHamburgerMenu';

export default MobileHamburgerMenu;