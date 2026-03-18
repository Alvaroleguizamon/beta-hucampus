import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1100,
};

export const SIDEBAR_WIDTH = 264;

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return {
    width,
    isMobile: width < BREAKPOINTS.tablet,
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
  };
}
