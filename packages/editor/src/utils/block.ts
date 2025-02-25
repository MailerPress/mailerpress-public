import {blockType, blockType as blockTypeEnum} from "../constants.ts";
import {blockType as IBlockType} from "../core/regisetBlockType.ts";
import BlockManager, {TPattern} from "../core/BlockManager.ts";
import {v4 as uuidv4} from 'uuid';
import Block from "../interfaces/block.ts";
import {deepSearch} from "./function.ts";
import {DirectionPosition, IRecord} from "./editorRoot.ts";
import blockLibrary from "../components/BlockLibrary.tsx";
import {cloneDeep} from "lodash";
import BlockPosition from "./BlockPosition.ts";

export function getNodeTypeClassName(type: string) {
    return `node-type-${type}`;
}

export function findPathToClientId(node, targetClientId, path = []) {
    // Ajouter le clientId actuel au chemin
    if (node.attributes && node.attributes.clientId) {
        path.push(node.attributes.clientId);
    } else if (node.clientId) {
        path.push(node.clientId);
    }

    // Si nous avons trouvé le clientId cible, retourner le chemin
    if (node.clientId === targetClientId) {
        return path;
    }

    // Si le noeud a des enfants, continuer la recherche de manière récursive
    if (node.children && node.children.length > 0) {
        for (let child of node.children) {
            const result = findPathToClientId(child, targetClientId, [...path]);
            if (result) {
                return result;
            }
        }
    }

    // Si le clientId cible n'est pas trouvé, supprimer le dernier clientId ajouté et retourner null
    path.pop();
    return null;
}

export function generateBlockContent(blockData: object, parent: string, parentClientId?: string) {

    const sectionBlock = BlockManager.getBlockByType(blockTypeEnum.SECTION).init({})
    const columnBlock = BlockManager.getBlockByType(blockTypeEnum.COLUMN).init({})
    const textBlock = BlockManager.getBlockByType(blockTypeEnum.TEXT).init({})

    if (([blockTypeEnum.PAGE, blockTypeEnum.WRAPPER].includes(parent) && blockData.type !== blockTypeEnum.WRAPPER)) {
        let state = {
            ...sectionBlock,
            clientId: uuidv4()
        }

        blockData = {
            ...blockData,
            clientId: uuidv4()
        }

        if (blockTypeEnum.COLUMN !== blockData.type && blockTypeEnum.SECTION !== blockData.type) {
            state = {
                ...state,
                children: [
                    {
                        ...columnBlock,
                        clientId: uuidv4(),
                        children: [
                            {...blockData}
                        ]
                    }
                ]
            }
        } else if (blockType.SECTION === blockData.type) {
            state = {
                ...state,
                children: [
                    {
                        ...columnBlock,
                        clientId: uuidv4(),
                    }
                ]
            }
        } else {
            state = {
                ...state,
                children: Array.from({length: sectionBlock.data.columnCount}, () => {
                    return {
                        ...blockData, clientId: uuidv4()
                    }
                })
            }
        }

        return state
    } else {
        if (blockData.type === blockType.WRAPPER) {
            return {
                ...blockData,
                children: [
                    {
                        ...sectionBlock,
                        clientId: uuidv4(),
                        children: [
                            {
                                ...columnBlock,
                                clientId: uuidv4(),
                                children: [
                                    {...textBlock, clientId: uuidv4()}
                                ]
                            }
                        ]
                    }
                ],
                clientId: uuidv4()
            }
        }

        return {
            ...blockData,
            parentClientId,
            clientId: uuidv4()
        }
    }
}

export function generateBlockPattern(blockData: TPattern) {
    return blockData
}

export function removeAllClientId(obj) {
    if (Array.isArray(obj)) {
        return obj.map(removeAllClientId);
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([key]) => key !== 'clientId')
                .map(([key, value]) => [key, removeAllClientId(value)])
        );
    }
    return obj;
}

export function addClientId(obj) {
    if (Array.isArray(obj)) {
        return obj.map(addClientId);
    } else if (typeof obj === 'object' && obj !== null) {
        obj.clientId = uuidv4(); // Add or regenerate the clientId
        for (let key in obj) {
            obj[key] = addClientId(obj[key]);
        }
    }
    return obj;
}

export function removeBlockByClientId(data, clientId) {
    function cloneAndRemove(entry) {
        if (!entry) return null;

        if (entry.clientId === clientId) {
            return null; // Remove target block
        }

        if (entry.children) {
            const newChildren = entry.children
                .map(cloneAndRemove) // Recursively check children
                .filter(child => child !== null);

            return {...entry, children: newChildren};
        }

        return {...entry};
    }

    return cloneAndRemove(data);
}

export function wrapSectionInWrapper(data, sectionClientId) {
    function traverse(entry) {
        if (!entry.children) return entry;

        return {
            ...entry,
            children: entry.children.map(child => {
                if (child.clientId === sectionClientId) {
                    return BlockManager.getBlockByType(blockType.WRAPPER).init({
                        clientId: uuidv4(),
                        children: [child], // Place the section inside the wrapper
                    })
                }
                return traverse(child);
            })
        };
    }

    return traverse(data);
}


export function addBlockInsideClientId(node, targetClientId, newChild) {
    // Si c'est la section cible, créer une nouvelle structure avec le nouveau bloc
    if (node.clientId === targetClientId) {
        return {
            ...node,
            children: [
                ...node.children,
                newChild
            ]
        };
    }

    // Sinon, parcourir les enfants et appliquer récursivement la fonction
    if (node.children && node.children.length > 0) {
        return {
            ...node,
            children: node.children.map(child => addBlockInsideClientId(child, targetClientId, newChild))
        };
    }

    // Retourner le nœud inchangé si aucune modification n'a été effectuée
    return node;
}

export function findRootAncestor(page, targetClientId) {
    let highestAncestor = null;

    function traverse(blocks, currentAncestor = null) {
        for (let block of blocks) {
            if (block.clientId === targetClientId) {
                highestAncestor = currentAncestor || block;
                return true;
            }
            if (block.children && block.children.length > 0) {
                if (traverse(block.children, currentAncestor || block)) {
                    return true;
                }
            }
        }
        return false;
    }

    if (page && Array.isArray(page.children)) {
        traverse(page.children);
    }

    return highestAncestor;
}

export function findParent(node, targetClientId, parent = null) {
    // Vérifier si le noeud actuel est le nœud cible
    if (node.clientId === targetClientId) {
        return parent; // Retourner le parent du nœud cible
    }

    // Parcourir les enfants du noeud actuel de manière récursive
    if (node.children && node.children.length > 0) {
        for (let child of node.children) {
            const result = findParent(child, targetClientId, node);
            if (result) {
                return result; // Si le parent est trouvé dans un sous-arbre, le retourner
            }
        }
    }

    return null; // Retourner null si le nœud cible n'est pas trouvé dans cet arbre
}

function duplicateNode(node) {
    const newNode = {
        ...node,
        clientId: uuidv4(),
        children: node.children ? node.children.map(duplicateNode) : []
    };
    return newNode;
}

export function replaceBlockByClientId(structure, targetClientId, newBlock) {
    if (!structure || typeof structure !== 'object') return structure;

    // Si le bloc actuel est celui à remplacer, retourne le nouveau bloc
    if (structure.clientId === targetClientId) {
        return newBlock;
    }

    // Si le bloc a des enfants, on itère récursivement sur eux
    if (Array.isArray(structure.children)) {
        structure.children = structure.children.map(child =>
            replaceBlockByClientId(child, targetClientId, newBlock)
        );
    }

    return structure;
}

export function duplicateBlockByClientId(data, clientId) {
    // Fonction récursive pour rechercher et dupliquer le bloc avec le clientId spécifié
    function findAndDuplicate(node, clientId) {
        if (node.clientId === clientId) {
            const duplicatedNode = duplicateNode(node);
            return [node, duplicatedNode];
        } else if (node.children) {
            let newChildren = [];
            for (let child of node.children) {
                const result = findAndDuplicate(child, clientId);
                if (result) {
                    newChildren = newChildren.concat(result);
                } else {
                    newChildren.push(child);
                }
            }
            return {...node, children: newChildren};
        } else {
            return node;
        }
    }

    const updatedChildren = data.children.map(child => findAndDuplicate(child, clientId)).flat();
    return {...data, children: updatedChildren};
}

function findNodeById(node, targetId) {
    if (node.clientId === targetId) return node;
    if (!node.children) return null;

    for (const child of node.children) {
        const found = findNodeById(child, targetId);
        if (found) return found;
    }
    return null;
}

export function isChildOf(parentId, childId, tree) {
    const parentNode = findNodeById(tree, parentId);
    if (!parentNode || !parentNode.children) return false;

    function searchChildren(node) {
        for (const child of node.children) {
            if (child.clientId === childId) {
                return true;
            }
            if (child.children && searchChildren(child)) {
                return true;
            }
        }
        return false;
    }

    return searchChildren(parentNode);
}

export function findTheClosestParent(
    blocks: Array<Block>,
    clientId: string,
    type: string,
    blockToAdd: IBlockType
) {
    const blockType: IBlockType = BlockManager.getBlockByType(type)
    const pathRoot = getPathToRoot(blocks, clientId)

    if (blockToAdd.type === blockTypeEnum.WRAPPER) {
        return pathRoot.find(p => p.type === blockTypeEnum.WRAPPER) || 'page'
    }

    if (blockToAdd.disabledBlockType.length === 0 && pathRoot[pathRoot.length - 1].type === blockTypeEnum.WRAPPER) {

        if (pathRoot.find(p => p.type === blockTypeEnum.SECTION)) {
            return pathRoot[0]
        }

        return pathRoot.find(p => p.type === blockTypeEnum.WRAPPER)

    }

    if (blockToAdd.type === blockTypeEnum.SECTION) {
        if (pathRoot[pathRoot.length - 1].type === blockTypeEnum.WRAPPER) {
            return pathRoot[pathRoot.length - 1]
        }

        if (blockType.disabledBlockType.length === 0 || blockType.disabledBlockType.includes(blockToAdd.type)) {
            return pathRoot.find(f => f.type === blockTypeEnum.SECTION)
        }
    }

    if (blockToAdd.type === blockTypeEnum.COLUMN && blockType.disabledBlockType.length === 0) {
        return pathRoot.find(f => f.type === blockTypeEnum.COLUMN)
    }

    if (pathRoot[0].type === 'page') {
        return blocks.children[0]
    }

    return pathRoot[0]

    //
    // if (blockType.disabledBlockType.includes(blockToAdd.type)) {
    //     const nearestBlockAuthorized = pathRoot.find(b => {
    //         const blockType: IBlockType = BlockManager.getBlockByType(b.type)
    //         return !blockType.disabledBlockType.includes(blockToAdd.type)
    //     })
    //
    //     return nearestBlockAuthorized
    // }
    //
    // if(blockType.disabledBlockType.length === 0 && blockToAdd.disabledBlockType.length === 0) {
    //     return pathRoot[0]
    // }
    //
    // if(blockType.type === blockTypeEnum.COLUMN) {
    //     return pathRoot.find(p => p.type === blockTypeEnum.COLUMN)
    // }
    //
    // return pathRoot[pathRoot.length - 1];
}

export function getClientIdByClassNames(classnames: string) {
    const clientId = classnames.split(' ').reduce((acc, c) => {
        if (c.startsWith('node-client')) {
            acc += c.replace('node-client-', '');
        }
        return acc;
    }, '');

    return clientId
}

export function findBlockInState(blocks: Array<Block>, clientId: string): Block {
    return deepSearch(blocks, 'clientId', (k, v) => v === clientId)
}

export const addChildToParent = (data: Array<Block>, targetClientId: string, newChild: object) => {
    // Fonction récursive pour parcourir la structure JSON
    function recursiveInsert(data) {
        // Si data est un objet
        if (typeof data === 'object' && data !== null) {
            // Vérifier si le clientId correspond à celui cible
            if (data.clientId === targetClientId) {
                // Créer une copie profonde de l'objet pour maintenir l'immutabilité
                let newData = JSON.parse(JSON.stringify(data));
                // Ajouter le nouvel enfant à la liste children
                newData.children = newData.children || [];
                // Vérifier si le nouvel enfant n'existe pas déjà
                let childExists = newData.children.some(child => child.clientId === newChild.clientId);
                if (!childExists) {
                    newData.children.push(newChild);
                }
                return newData;
            }
            // Si data contient une propriété children
            if (data.children && Array.isArray(data.children)) {
                // Parcourir les enfants et appeler récursivement la fonction sur chacun d'eux
                let newChildren = data.children.map(child => recursiveInsert(child));
                // Retourner une copie de data avec les enfants mis à jour
                return {...data, children: newChildren};
            }
        }
        // Retourner data tel quel si le clientId ne correspond pas
        return data;
    }

    // Appeler la fonction récursive pour modifier la structure JSON
    return recursiveInsert(data);
};

export function canAddChildren(selectedBlock: Block) {
    const allowedBlocks = [
        blockTypeEnum.COLUMN,
        blockTypeEnum.SECTION,
        blockTypeEnum.PAGE,
        blockTypeEnum.WRAPPER,
    ]
    return (
        selectedBlock !== null && selectedBlock.block !== null && allowedBlocks.includes(selectedBlock.block.type)
    );
}

export const updateAttributesByClientId = (data, clientId, newAttributes) => {
    // Créer une copie de l'objet data pour éviter les modifications directes
    let newData = {...data};

    // Vérifier si le clientId de l'élément correspond à celui recherché
    if (newData.clientId === clientId) {
        // Mettre à jour les attributs de l'élément trouvé
        newData.attributes = {...newData.attributes, ...newAttributes};
    }

    // Parcourir récursivement les enfants
    if (newData.children && newData.children.length > 0) {
        newData.children = newData.children.map(child =>
            updateAttributesByClientId(child, clientId, newAttributes)
        );
    }

    return newData;


};

export function updateAttributesByKey(data, key, newAttributes) {
    if (!data || typeof data !== "object") return data;

    return {
        ...data,
        children: data.children?.map(child => {
            if (child.type === key) {
                return {
                    ...child,
                    attributes: {...child.attributes, ...newAttributes}
                };
            }
            return updateAttributesByKey(child, key, newAttributes);
        })
    };
}

export const updateDataByClientId = (data, clientId, newAttributes) => {
    let newData = {...data};

    if (newData.clientId === clientId) {
        newData.data = {...newData.data, ...newAttributes};
    }

    if (newData.children && newData.children.length > 0) {
        newData.children = newData.children.map(child =>
            updateDataByClientId(child, clientId, newAttributes)
        );
    }

    return newData;
};

export function updateDataAndAttributes(data, clientId, updates) {
    let clonedData = {...data};

    function findAndUpdateItem(node) {
        if (node.clientId === clientId) {
            // Mise à jour des champs data si présents dans updates
            if (updates.data) {
                if (!node.data) {
                    node.data = {};
                }
                for (let key in updates.data) {
                    node.data[key] = updates.data[key];
                }
            }
            // Mise à jour des champs attributes si présents dans updates
            if (updates.attributes) {
                if (!node.attributes) {
                    node.attributes = {};
                }
                for (let key in updates.attributes) {
                    node.attributes[key] = updates.attributes[key];
                }
            }
            // Mise à jour des champs attributes si présents dans updates
            if (updates.mobileAttributes) {
                if (!node.mobileAttributes) {
                    node.mobileAttributes = {};
                }
                for (let key in updates.mobileAttributes) {
                    node.mobileAttributes[key] = updates.mobileAttributes[key];
                }
            }
        } else if (node.children && node.children.length > 0) {
            node.children.forEach(child => findAndUpdateItem(child));
        }
    }

    findAndUpdateItem(clonedData);
    return clonedData;
}

const searchClientId = (data, targetClientId) => {
    // Vérifier si le clientId actuel correspond au clientId recherché
    if (data.clientId === targetClientId) {
        return true;
    }

    // Parcourir tous les enfants de l'élément actuel
    if (data.children && data.children.length > 0) {
        for (const child of data.children) {
            // Appel récursif sur chaque enfant
            if (searchClientId(child, targetClientId)) {
                return true; // Si le clientId est trouvé dans cet enfant, retourner true
            }
        }
    }

    // Si le clientId n'est pas trouvé dans cet élément ou ses enfants, retourner false
    return false;
};
// Fonction pour vérifier si un clientId est un enfant d'un autre clientId spécifique
export const isChildOfClientId = (data, targetClientId, parentClientId) => {
    // Vérifier si le parentId contient le clientId recherché
    if (searchClientId(data, parentClientId)) {
        // Vérifier si le clientId recherché est un enfant de parentId
        return searchClientId(data, targetClientId);
    }
    return false; // Si parentId ne contient pas le clientId recherché, retourner false
};
export const isChildInSection = (data, targetClientId, sectionClientId) => {
    // Vérifier si le clientId actuel correspond au clientId recherché
    if (data.clientId === targetClientId) {
        return true;
    }

    // Si le type de l'élément est différent de 'section' et qu'on atteint une section, arrêter la recherche
    if ((data.type !== 'section' && data.type !== 'hero') && sectionClientId === data.clientId) {
        return false;
    }

    // Parcourir tous les enfants de l'élément actuel
    if (data.children && data.children.length > 0) {
        for (const child of data.children) {
            // Appel récursif sur chaque enfant
            if (isChildInSection(child, targetClientId, sectionClientId)) {
                return true; // Si le clientId est trouvé dans cet enfant, retourner true
            }
        }
    }

    // Si le clientId n'est pas trouvé dans cet élément ou ses enfants, retourner false
    return false;
};

export function getPlaceholder(type: blockTypeEnum) {

    let text: null | string = null;

    if (type === blockTypeEnum.PAGE) {
        text = 'Drop a Wrapper block here';
    } else if (type === blockTypeEnum.WRAPPER) {
        text = 'Drop a Section block here';
    } else if (
        type === blockTypeEnum.SECTION ||
        type === blockTypeEnum.GROUP
    ) {
        text = 'Drop a Column block here';
    } else if (type === blockTypeEnum.COLUMN) {
        text = 'Drop a content block here';
    }

    if (!text) return null;

    return `
   <mj-text color="#666">
    <div style="text-align: center">
      <div>
        <svg width="300" fill="currentColor" style="max-width: 100%;" viewBox="-20 -5 80 60">
          <g>
            <path d="M23.713 23.475h5.907c.21 0 .38.17.38.38v.073c0 .21-.17.38-.38.38h-5.907a.38.38 0 0 1-.38-.38v-.073c0-.21.17-.38.38-.38zm.037-2.917h9.167a.417.417 0 0 1 0 .834H23.75a.417.417 0 0 1 0-.834zm0-2.5h9.167a.417.417 0 0 1 0 .834H23.75a.417.417 0 0 1 0-.834zm-.037-3.333h5.907c.21 0 .38.17.38.38v.073c0 .21-.17.38-.38.38h-5.907a.38.38 0 0 1-.38-.38v-.073c0-.21.17-.38.38-.38zm.037-2.917h9.167a.417.417 0 0 1 0 .834H23.75a.417.417 0 0 1 0-.834zm0-2.916h9.167a.417.417 0 0 1 0 .833H23.75a.417.417 0 0 1 0-.833zm-3.592 8.75a.675.675 0 0 1 .675.691v6.142c0 .374-.3.679-.675.683h-6.15a.683.683 0 0 1-.675-.683v-6.142a.675.675 0 0 1 .675-.691h6.15zM20 24.308v-5.833h-5.833v5.833H20zm.158-15.833a.675.675 0 0 1 .675.692v6.141c0 .374-.3.68-.675.684h-6.15a.683.683 0 0 1-.675-.684V9.167a.675.675 0 0 1 .675-.692h6.15zM20 15.142V9.308h-5.833v5.834H20zM37.167 0A2.809 2.809 0 0 1 40 2.833V30.5a2.809 2.809 0 0 1-2.833 2.833h-3.834v3H32.5v-3h-23A2.808 2.808 0 0 1 6.667 30.5v-23H3.583v-.833h3.084V2.833A2.808 2.808 0 0 1 9.5 0h27.667zm2 30.5V2.833a2.025 2.025 0 0 0-2-2H9.5a2.025 2.025 0 0 0-2 2V30.5a2.025 2.025 0 0 0 2 2h27.667a2.025 2.025 0 0 0 2-2zM0 27.75h.833V31H0v-3.25zm0-13h.833V18H0v-3.25zm0 22.833V34.25h.833v3.25L0 37.583zM0 21.25h.833v3.25H0v-3.25zM2.583 40l.084-.833h3.166V40h-3.25zm27.917-.833c.376.006.748-.08 1.083-.25l.417.666a2.875 2.875 0 0 1-1.5.417h-1.833v-.833H30.5zm-8.333 0h3.25V40h-3.25v-.833zm-6.584 0h3.25V40h-3.25v-.833zm-6.5 0h3.25V40h-3.25v-.833zM0 9.5c.01-.5.154-.99.417-1.417l.666.417c-.17.305-.256.65-.25 1v2H0v-2z"></path>
          </g>
          <text x="-16" y="50" font-size="5px">${text}</text>
        </svg>
      </div>
    </div>
   </mj-text>
  `;
}

export function findAndRemoveItem(node, targetId, parent = null) {
    if (node) {
        if (node.clientId === targetId) {
            if (parent) {
                parent.children = parent.children.filter(child => child.clientId !== targetId);
            }
        } else if (node.children && node.children.length > 0) {
            node.children.forEach(child => findAndRemoveItem(child, targetId, node));
        }
    }
    return node

}

export function repositionBlock(blocks, blockClientId, targetClientId, position) {
    let blockToMove = null;

    // Trouver et retirer le bloc
    function findAndRemoveBlock(blocks) {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].clientId === blockClientId) {
                blockToMove = blocks.splice(i, 1)[0];
                return true;
            }
            if (blocks[i].children && blocks[i].children.length > 0) {
                if (findAndRemoveBlock(blocks[i].children)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Insérer le bloc à la bonne position
    function insertBlock(blocks, targetClientId) {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].clientId === targetClientId) {
                const newIndex = position === "top" ? i : i + 1;
                blocks.splice(newIndex, 0, blockToMove);
                return true;
            }
            if (blocks[i].children && blocks[i].children.length > 0) {
                if (insertBlock(blocks[i].children, targetClientId)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Étape 1 : Trouver et retirer le bloc
    const blockFound = findAndRemoveBlock(blocks);

    // Étape 2 : Insérer le bloc si trouvé
    if (blockFound && blockToMove) {
        insertBlock(blocks, targetClientId);
    }

    return blocks;
}

// Fonction pour trouver et déplacer un clientId
export function moveClientId(data, targetId, referenceId, position) {
    let targetItem, referenceIndex;

    // Fonction récursive pour trouver et retirer l'élément cible
    function findAndRemoveItem(node, parent = null) {

        if (node.clientId === targetId) {
            targetItem = node;
            if (parent) {
                parent.children = parent.children.filter(child => child.clientId !== targetId);
            }
        } else if (node.children && node.children.length > 0) {
            node.children.forEach(child => findAndRemoveItem(child, node));
        }
    }

    // Fonction récursive pour trouver l'index de l'élément de référence
    function findReferenceIndex(node) {
        if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                if (node.children[i].clientId === referenceId) {
                    referenceIndex = i;
                    return node;
                }
                let foundNode = findReferenceIndex(node.children[i]);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
    }

    // Fonction récursive pour trouver l'élément de référence directement
    function findReferenceNode(node) {
        if (node.clientId === referenceId) {
            return node;
        } else if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                let foundNode = findReferenceNode(node.children[i]);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
    }

    findAndRemoveItem(data);
    if (!targetItem) {
        return data;
    }

    let referenceParent = findReferenceIndex(data);
    let referenceNode = findReferenceNode(data);
    if (!referenceParent && !referenceNode) {
        return data;
    }

    // Gérer le cas "inside"
    if (position === 'inside') {
        if (!referenceNode.children) {
            referenceNode.children = [];
        }
        referenceNode.children.push(targetItem);
    } else if (position === 'top') {
        referenceParent.children.splice(referenceIndex, 0, targetItem);
    } else if (position === 'bottom') {
        referenceParent.children.splice(referenceIndex + 1, 0, targetItem);
    }

    return data;
}

export const getPathToRoot = (data, targetClientId) => {
    const path = [];

    const findPath = (node, targetClientId) => {
        if (node.clientId === targetClientId) {
            path.push(node);
            return true;
        }

        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                if (findPath(child, targetClientId)) {
                    if (node.type !== 'page') {
                        path.push(node);
                        return true;
                    }

                }
            }
        }

        return false;
    };

    findPath(data, targetClientId);
    return path;
};
export const addNewChild = (data, clientId, newChild, position = 'bottom') => {
    // Fonction récursive pour trouver et insérer le nouveau child
    const findAndInsert = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            // Si le node a des children, rechercher récursivement
            if (node.children && node.children.length > 0) {
                if (findAndInsert(node.children)) {
                    return true; // Sortir après insertion
                }
            }

            // Si le clientId du node courant correspond au clientId spécifié
            if (node.clientId === clientId) {
                if (position === 'top') {
                    nodes.splice(i, 0, newChild); // Insérer au-dessus
                } else if (position === 'bottom') {
                    nodes.splice(i + 1, 0, newChild); // Insérer en dessous
                } else {
                    node.children.push(newChild);
                }

                return true; // Sortir après insertion
            }
        }
        return false; // Si aucun élément n'a été trouvé
    };

    // Vérifier si nous voulons ajouter un enfant directement sous le type 'page'
    if (clientId === 'page') {
        if (position === 'top') {
            data.children.unshift(newChild); // Ajouter au début des enfants
        } else if (position === 'bottom') {
            data.children.push(newChild); // Ajouter à la fin des enfants
        } else {
            data.children.unshift(newChild); // Ajouter au début des enfants
        }
    } else if (data.type === 'page' && data.children) {
        // Démarrer le processus de recherche et insertion
        findAndInsert(data.children);
    }

    return data;
};
export const contentBlocks = [
    blockTypeEnum.TEXT,
    blockTypeEnum.IMAGE,
    blockTypeEnum.BUTTON,
    blockTypeEnum.DIVIDER,
    blockTypeEnum.HEADING,
    blockTypeEnum.QUERY_PATTERN
];

/**
 * Function to determine witch position is acceptable
 * @param blocks
 * @param nodeInfo
 * @param blockCurrentlyDragged
 */
export function getInsertPosition(blocks: Array<Block>, nodeInfo: IRecord, blockCurrentlyDragged: IBlockType) {
    const path = getPathToRoot(blocks, nodeInfo?.clientId)

    if (null === blockCurrentlyDragged) {
        return
    }

    if (path.length === 1 && path[0].data.lock) {
        return {
            type: path[0].type,
            clientId: path[0].clientId,
            direction: 'top'
        }
    }

    return BlockPosition.getPosition(
        path,
        blockCurrentlyDragged
    )
}
