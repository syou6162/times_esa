import { useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

export type UseResponsiveLayoutReturn = {
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

export const useResponsiveLayout = (): UseResponsiveLayoutReturn => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
  };
};