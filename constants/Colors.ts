// Modern pastel color palette with better contrast
const primaryColor = '#8B5CF6'; // Modern purple
const secondaryColor = '#EC4899'; // Modern pink
const accentColor = '#10B981'; // Modern emerald
const warningColor = '#F59E0B'; // Modern amber
const errorColor = '#EF4444'; // Modern red

const tintColorLight = primaryColor;
const tintColorDark = '#A78BFA'; // Lighter purple

export default {
  light: {
    text: '#374151',
    background: '#F8FAFC', // Modern light background
    tint: tintColorLight,
    placeholder: '#9CA3AF',
    secondaryBackground: '#FFFFFF',
    secondaryText: '#6B7280',
    slider: 'rgba(139, 92, 246, 0.2)',
    
    // Soft pastel colors
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    warning: warningColor,
    error: errorColor,
    
    // Gradient colors - modern pastels
    gradientStart: '#EC4899',
    gradientEnd: '#8B5CF6',
    
    // Card colors - modern and clean
    cardBackground: '#FFFFFF',
    cardBorder: '#E5E7EB',
    
    // Action button colors - modern pastels
    sleepColor: '#3B82F6', // Modern blue
    feedColor: '#F59E0B', // Modern amber
    diaperColor: '#10B981', // Modern emerald
    activityColor: '#EC4899', // Modern pink
    milestoneColor: '#8B5CF6', // Modern purple
    
    // Cloud background colors
    cloudColor: '#FFFFFF',
    cloudShadow: 'rgba(0, 0, 0, 0.05)',
    
    // Additional modern colors
    softBlue: '#3B82F6',
    softPink: '#EC4899',
    softGreen: '#10B981',
    softYellow: '#F59E0B',
    softPurple: '#8B5CF6',
    softOrange: '#F97316',
  },
  dark: {
    text: '#F9FAFB',
    background: '#111827', // Modern dark background
    tint: tintColorDark,
    placeholder: '#9CA3AF', 
    secondaryBackground: '#1F2937',
    secondaryText: '#D1D5DB',
    slider: 'rgba(167, 139, 250, 0.2)',
    
    // Modern colors for dark mode
    primary: '#A78BFA',
    secondary: '#F472B6',
    accent: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    
    // Gradient colors - modern
    gradientStart: '#F472B6',
    gradientEnd: '#A78BFA',
    
    // Card colors - modern and clean
    cardBackground: '#1F2937',
    cardBorder: '#374151',
    
    // Action button colors - modern
    sleepColor: '#60A5FA', // Modern blue
    feedColor: '#FBBF24', // Modern amber
    diaperColor: '#34D399', // Modern emerald
    activityColor: '#F472B6', // Modern pink
    milestoneColor: '#A78BFA', // Modern purple
    
    // Cloud background colors
    cloudColor: '#4A4A5A',
    cloudShadow: 'rgba(0, 0, 0, 0.1)',
    
    // Additional modern colors
    softBlue: '#60A5FA',
    softPink: '#F472B6',
    softGreen: '#34D399',
    softYellow: '#FBBF24',
    softPurple: '#A78BFA',
    softOrange: '#FB923C',
  },
};
