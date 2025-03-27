/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes:{
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
          slideInLeft: {
            "0%": { opacity: 0, transform: "translateX(-50px)" },
            "100%": { opacity: 1, transform: "translateX(0)" },
          },
          slideInRight: {
            "0%": { opacity: 0, transform: "translateX(50px)" },
            "100%": { opacity: 1, transform: "translateX(0)" },
          },
      },
      animation: {
        slideInDown: 'slideInDown 0.7s ease-out forwards',
        slideInUp: 'slideInUp 0.7s ease-out forwards',
        slideInLeft: "slideInLeft 0.6s ease-out",
        slideInRight: "slideInRight 0.6s ease-out"
      },
      colors: {
        primary: '#3b82f6', // Blue for primary actions
        secondary: '#6b7280', // Gray for secondary elements
        success: '#10b981', // Green for success messages
        danger: '#ef4444', // Red for error/delete actions
        warning: '#f59e0b', // Yellow for warnings
        pro: '#a855f7', // Purple for Pro batch
        classic: '#22c55e', // Green for Classic batch
        basic: '#3b82f6', // Blue for Basic batch
      },
    },
  },
  plugins: [],
}