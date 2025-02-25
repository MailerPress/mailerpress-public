import {findParent, findRootAncestor, removeBlockByClientId, addNewChild} from "../../utils/block.ts";
import {blockType as blockTypeEnum} from '../../constants.ts';
import Block from "../../interfaces/block.ts";
import {blockType} from "../../constants.ts";
import {v4 as uuidv4} from 'uuid';

export function removeAndMove(data: any, selectedBlock: any, blockHovered: any, generatedBlock: blockType | null = null) {
    if (generatedBlock) {
        // Update the block before inserting
        generatedBlock = updateWrapperStatus(selectedBlock, blockHovered, generatedBlock);
        // Move first before removing
        data = addNewChild(data, blockHovered.selectedClientId, generatedBlock, blockHovered.direction);
    }

    // Now remove if the original parent is empty
    let parent = findParent(data, selectedBlock.clientId);

    // Determine the closest removable parent
    let targetToRemove = selectedBlock.clientId;
    while (parent && parent.children.length === 1) {
        targetToRemove = parent.clientId;
        parent = findParent(data, parent.clientId); // Move up
    }

    // Remove the block and clean up empty parents
    data = removeBlockByClientId(data, targetToRemove);
    data = removeEmptyParents(data); // Ensure we clean up empty parents

    return data;
}


function removeEmptyParents(entry) {
    if (!entry || entry.clientId === "page") return entry; // Don't remove root

    if (entry.children) {
        entry.children = entry.children.map(removeEmptyParents).filter(child => child !== null);
    }

    // Remove the parent if it has no children left
    if (!entry.children || entry.children.length === 0) {
        return null;
    }

    return entry;
}


function updateWrapperStatus(selectedBlock: Block, blockHovered: Block, generatedBlock: blockType) {
    if (selectedBlock.type === blockTypeEnum.QUERY) {
        generatedBlock.data = {
            ...generatedBlock.data,
            inWrapper: blockHovered.type === blockTypeEnum.WRAPPER
        };
    }
    return {
        ...generatedBlock,
        clientId: uuidv4()
    };
}
