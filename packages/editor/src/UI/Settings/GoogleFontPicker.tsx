import { useState } from "react";

// List of Google Fonts with available variants
const googleFonts = [
    { name: "Roboto", variants: [400, 500, 700, 900] },
    { name: "Open Sans", variants: [300, 400, 600, 700] },
    { name: "Lato", variants: [100, 300, 400, 700, 900] },
    { name: "Montserrat", variants: [400, 500, 600, 700, 800] },
    { name: "Oswald", variants: [200, 300, 400, 500, 600, 700] },
];

const GoogleFontPicker = ({ onFontSelect }) => {
    const [selectedFont, setSelectedFont] = useState("");
    const [selectedVariants, setSelectedVariants] = useState([]);

    const handleFontChange = (event) => {
        const font = event.target.value;
        setSelectedFont(font);
        setSelectedVariants([]); // Reset variants when switching fonts
        loadGoogleFont(font, []);
        onFontSelect(font, []);
    };

    const handleVariantChange = (event) => {
        const { value, checked } = event.target;
        let updatedVariants = checked
            ? [...selectedVariants, value]
            : selectedVariants.filter((v) => v !== value);

        setSelectedVariants(updatedVariants);
        loadGoogleFont(selectedFont, updatedVariants);
        onFontSelect(selectedFont, updatedVariants);
    };

    // Dynamically load Google Font with selected variants
    const loadGoogleFont = (font, variants) => {
        if (!font) return;

        // Format variants (e.g., "400;500;700")
        const variantString = variants.length > 0 ? `:wght@${variants.join(";")}` : "";

        const fontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}${variantString}&display=swap`;

        // Avoid duplicate font loading
        if (!document.querySelector(`link[href="${fontUrl}"]`)) {
            const link = document.createElement("link");
            link.href = fontUrl;
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
    };

    return (
        <div>
            <label>Select a Google Font:</label>
            <select value={selectedFont} onChange={handleFontChange}>
                <option value="">Select a font...</option>
                {googleFonts.map((font) => (
                    <option key={font.name} value={font.name}>
                        {font.name}
                    </option>
                ))}
            </select>

            {selectedFont && (
                <>
                    <label>Select Variants:</label>
                    <div>
                        {googleFonts
                            .find((f) => f.name === selectedFont)
                            ?.variants.map((variant) => (
                                <label key={variant} style={{ marginRight: "10px" }}>
                                    <input
                                        type="checkbox"
                                        value={variant}
                                        checked={selectedVariants.includes(variant.toString())}
                                        onChange={handleVariantChange}
                                    />
                                    {variant}
                                </label>
                            ))}
                    </div>
                </>
            )}

            {selectedFont && selectedVariants.length > 0 && (
                <p style={{ fontFamily: selectedFont, fontWeight: selectedVariants[0] }}>
                    Preview text in {selectedFont} ({selectedVariants.join(", ")})
                </p>
            )}
        </div>
    );
};

export default GoogleFontPicker;
