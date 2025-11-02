/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // Tất cả file React
    ],
    theme: {
        extend: {
            colors: {
                primary: "#16a34a", // xanh lá nhẹ nhàng (PlantCare style 🌿)
                secondary: "#15803d",
                accent: "#86efac",
            },
        },
    },
    plugins: [],
};

