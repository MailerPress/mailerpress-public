export function extractStyle(input) {
    if (!input) return null;

    // Check if the input contains '--'
    if (input.includes('--')) {
        const parts = input.split('--');
        return parts[parts.length - 1].replace(')', ''); // Return the last part, removing trailing ')'
    }

    // Check if the input contains '|'
    if (input.includes('|')) {
        const parts = input.split('|');
        return parts[parts.length - 1];
    }

    return null;
}

export function deepMerge(target, source) {
    const output = {...target}; // Create a shallow copy of the target

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            // If value is an object, recursively merge
            if (typeof source[key] === 'object' && source[key] !== null) {
                output[key] = deepMerge(output[key] || {}, source[key]);
            } else {
                // Otherwise, directly assign
                output[key] = source[key];
            }
        }
    }

    return output; // Return a new object
}

export const findValueInsideTheme = (theme, path) => {
    let preset = getValueByPath(theme, path)
    return preset
}


export const findColorInsideThemePalette = (theme, path) => {

    let preset = getValueByPath(theme, path)

    if (preset === 'currentColor') {
        preset = getValueByPath(theme, 'styles > color > text')
    }

    const slug = extractStyle(preset)

    if (slug) {
        if (theme.settings.color.palette.find(p => p.slug === slug)) {
            return theme.settings.color.palette.find(p => p.slug === slug).color
        } else {
            if (window.jsVars.globalSettings.color.palette.default.find(p => p.slug === slug)) {
                return window.jsVars.globalSettings.color.palette.default.find(p => p.slug === slug).color

            }
        }
    }

    return 'white'
}

function getValueByPath(obj, path) {
    // Split the path string into keys
    const keys = path.split(' > ');

    // Use reduce to traverse the object based on keys
    return keys.reduce((current, key) => {
        if (current && key in current) {
            return current[key];
        }
        return undefined; // Return undefined if the key is not found
    }, obj);
}

export function convertToValidHex(hex) {
    if (!hex || typeof hex !== "string") {
        throw new Error("Invalid input: hex color must be a non-empty string");
    }

    if (hex.length === 9) { // Includes alpha
        const rgb = hex.slice(0, 7); // Extract RGB part
        const alphaHex = hex.slice(7); // Extract alpha part
        const alphaDecimal = parseInt(alphaHex, 16) / 255; // Convert alpha to decimal

        // Convert to RGB and RGBA formats
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return {
            hex: rgb, // Standard 6-digit hex
            rgba: `rgba(${r}, ${g}, ${b}, ${alphaDecimal.toFixed(2)})` // RGBA format
        };
    } else if (hex.length === 7) { // Standard hex
        return {hex: hex};
    } else {
        return {
            hex: "#000",
            rgba: `rgba(0,0,0,1)` // RGBA format
        }
    }
}
