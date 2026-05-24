import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const fontConfig = configureFonts({ config: {} });

export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: fontConfig,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976D2',
    secondary: '#5E35B1',
    tertiary: '#00897B',
  },
};

export type AppTheme = typeof appTheme;
