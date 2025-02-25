import {isEmpty} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import {__} from "@wordpress/i18n";

export function deepSearch(object, key, predicate) {
    if (object.hasOwnProperty(key) && predicate(key, object[key]) === true) return object

    for (let i = 0; i < Object.keys(object).length; i++) {
        let value = object[Object.keys(object)[i]];
        if (typeof value === "object" && value != null) {
            let o = deepSearch(object[Object.keys(object)[i]], key, predicate)
            if (o != null) return o
        }
    }
    return null
}

export const findBlocksByType = (data, targetType, foundBlocks = []) => {
    // Vérifier si le bloc actuel correspond au type recherché
    if (data.type === targetType) {
        foundBlocks.push(data); // Ajouter le bloc à la liste des blocs trouvés
    }

    // Parcourir récursivement les enfants
    if (data.children && data.children.length > 0) {
        data.children.forEach(child => {
            findBlocksByType(child, targetType, foundBlocks); // Appel récursif pour chaque enfant
        });
    }

    return foundBlocks[0];
};

export function addClientIdImmutableWithUnique(element, depth = 0) {
    // Générer un identifiant unique basé sur la profondeur et le temps actuel
    const clientId = uuidv4();

    // Créer une copie de l'élément actuel avec la clé clientId ajoutée
    const updatedElement = {
        ...element,
        clientId: clientId
    };

    // Créer une copie des enfants avec la clé clientId ajoutée récursivement
    if (updatedElement.children && updatedElement.children.length > 0) {
        updatedElement.children = updatedElement.children.map((child, index) => {
            // Appeler récursivement la fonction en augmentant la profondeur
            return addClientIdImmutableWithUnique(child, depth + 1);
        });
    }

    return updatedElement;
}

export function generaMjmlMetaData(data) {
    const attributes = [
        'content-background-color',
        'text-color',
        'font-family',
        'font-size',
        'line-height',
        'font-weight',
        'user-style',
        'responsive',
    ];

    return `
    <mj-html-attributes>
  
    </mj-html-attributes>
  `;
}

export const editBorder = (val) => {

    if (val.color === undefined && val.width === '0px') {
        return {
            'border-left': `0px solid transparent`,
            'border-right': `0px solid transparent`,
            'border-top': `0px solid transparent`,
            'border-bottom': `0px solid transparent`,
        }
    }

    const generateBorderAlone = () => {
        let borderConfig = {}
        const looper = ['top', 'left', 'right', 'bottom']
        looper.forEach(area => {
            if (val[area].color !== undefined && val[area].width !== undefined) {
                borderConfig = {
                    ...borderConfig,
                    [`border-${area}`]: `${val[area].width} ${val[area].style} ${val[area].color}`,
                }
            }
        })

        if (!isEmpty(borderConfig)) {
            return borderConfig
        }

    }

    if (val.color !== undefined && val.width !== undefined) {
        return {
            'border-left': `${val.width} ${val.style} ${val.color}`,
            'border-right': `${val.width} ${val.style} ${val.color}`,
            'border-top': `${val.width} ${val.style} ${val.color}`,
            'border-bottom': `${val.width} ${val.style} ${val.color}`,
        }
    } else {
        if (val.top !== undefined) {
            return generateBorderAlone()
        }
    }
}

export const editBorderRadius = val => {
    if (val === undefined) {
        return '0px'
    }

    if (typeof val === "string") {
        return val
    } else {
        return `${val.topLeft ? `${val.topLeft}px` : '0px'} ${val.topRight ? `${val.topRight}px` : '0px'} ${val.bottomRight ? `${val.bottomRight}px` : '0px'} ${val.bottomLeft ? `${val.bottomLeft}px` : '0px'}`
    }
}

export function t(string: string) {
    return __(string, 'mailerpress')
}

export function addQueryParamToUrl(url: string, params: object) {
    const urlObject = new URL(url);
    Object.entries(params).forEach(entry => {
        urlObject.searchParams.append(entry[0], entry[1]);
    })
    window.history.pushState({}, '', urlObject);

}

export function unserialize(data) {
    // Parse serialized PHP data
    const unserializePHP = (data) => {
        let offset = 0;

        const read = () => data.charAt(offset++);
        const parseString = () => {
            const length = parseInt(readUntil(':"'));
            offset++; // skip opening quote
            const str = data.substr(offset, length);
            offset += length + 2; // skip closing quote and semicolon
            return str;
        };
        const readUntil = (char) => {
            let str = '';
            while (data.charAt(offset) !== char) str += read();
            offset++;
            return str;
        };

        const parseValue = () => {
            const type = read().toLowerCase();
            read(); // skip colon

            if (type === 'a') {
                const items = parseInt(readUntil(':')) * 2;
                read(); // skip opening brace
                const obj = {};
                for (let i = 0; i < items; i += 2) {
                    const key = parseValue();
                    const value = parseValue();
                    obj[key] = value;
                }
                read(); // skip closing brace
                return obj;
            } else if (type === 's') {
                return parseString();
            } else if (type === 'i' || type === 'd') {
                return parseInt(readUntil(';'));
            } else if (type === 'b') {
                return read() === '1';
            }
            throw new Error('Unsupported data type');
        };

        return parseValue();
    };

    return unserializePHP(data);
}