import { useTheme } from "@/components/theme/ThemeProvider";

export const useChartTheme = () => {
  const { currentTheme } = useTheme();
  
  const getTooltipStyle = () => ({
    backgroundColor: currentTheme === 'dark' ? 'hsl(var(--card))' : 'hsl(var(--card))',
    border: `1px solid ${currentTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))'}`,
    borderRadius: '6px',
    color: currentTheme === 'dark' ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
  });

  const getAxisStyle = () => ({
    tick: {
      fill: currentTheme === 'dark' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
    },
    axisLine: {
      stroke: currentTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))',
    },
    tickLine: {
      stroke: currentTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))',
    },
  });

  const getGridStyle = () => ({
    stroke: currentTheme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted))',
    opacity: 0.3,
  });

  return {
    currentTheme,
    getTooltipStyle,
    getAxisStyle,
    getGridStyle,
  };
};
