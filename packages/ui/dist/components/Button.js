import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Button = ({ children, onClick, variant = 'primary' }) => {
    const base = 'px-4 py-2 rounded font-semibold';
    const styles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-black hover:bg-gray-300',
    };
    return (_jsx("button", { onClick: onClick, className: `${base} ${styles[variant]}`, children: children }));
};
// Example usage in apps/web/app/page.tsx
// Removed unnecessary import of Button
export default function HomePage() {
    return (_jsxs("div", { children: [_jsx("h1", { children: "Property Portal" }), _jsx(Button, { variant: "primary", onClick: () => alert('Clicked!'), children: "Click Me" })] }));
}
