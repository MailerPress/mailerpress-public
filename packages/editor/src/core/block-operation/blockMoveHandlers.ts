import {getHandlerForType} from "./blockUtils.ts";
import {removeAndMove} from "./blockOperations.ts";
import Block from "../../interfaces/block.ts";
import {
    createBlock, generateBlockInsideColumn,
    generateBlockInsideSection,
    generateBlockInsideWrapper,
    moveColumnBlock
} from "./blockGeneration.ts";
import {blockType} from "../../constants.ts";

export function handleContentBlockMove(selectedBlock: Block, blockHovered: Block, data: Array<Block>) {
    const handler = getHandlerForType(selectedBlock.type) || handleDefaultCase;
    return handler(selectedBlock, blockHovered, data);
}

export function handleNonContentBlockMove(selectedBlock: Block, blockHovered: Block, data: Array<Block>) {
    const handler = getHandlerForType(selectedBlock.type) || handleDefaultNonContentMoveCase;
    return handler(selectedBlock, blockHovered, data);
}

function shouldWrapInSection(blockHovered, selectedBlock) {
    return (blockHovered.type === blockType.WRAPPER && selectedBlock.type !== blockType.WRAPPER)
}

export function handleWrapperCase(selectedBlock: Block, blockHovered: Block, data: Array<Block>) {
    const newBlock = shouldWrapInSection(blockHovered, selectedBlock)
        ? generateBlockInsideWrapper(selectedBlock, true)
        : selectedBlock;

    return removeAndMove(data, selectedBlock, blockHovered, newBlock);
}

export function handleSectionCase(selectedBlock: Block, blockHovered: Block, data: Array<Block>) {
    return handleDefaultCase(selectedBlock, blockHovered, data);
}

export function handleColumnCase(selectedBlock: Block, blockHovered: Block, data: Array<Block>) {
    let newBlock = generateBlockInsideWrapper(selectedBlock, true)
    switch (blockHovered.type) {
        case blockType.WRAPPER:
        case blockType.PAGE:
        case blockType.SECTION:
            newBlock = moveColumnBlock(selectedBlock, true)
            break
        case blockType.COLUMN:
            newBlock = generateBlockInsideColumn(selectedBlock, true)
            break
    }


    return removeAndMove(data, selectedBlock, blockHovered, newBlock);
}

export function handleContentCase(selectedBlock: Block, blockHovered: Block, data: Array<Block>) {
    let newBlock = generateBlockInsideWrapper(selectedBlock, true)
    switch (blockHovered.type) {
        case blockType.WRAPPER:
        case blockType.PAGE:
            newBlock = generateBlockInsideWrapper(selectedBlock, true)
            break
        case blockType.COLUMN:
            newBlock = generateBlockInsideColumn(selectedBlock, true)
            break
    }

    return removeAndMove(data, selectedBlock, blockHovered, newBlock);
}

export function handleQueryCase(selectedBlock: Block, blockHovered: Block, data: Array<Block>) {
    let newBlock = generateBlockInsideWrapper(selectedBlock, true)

    return removeAndMove(data, selectedBlock, blockHovered, newBlock);
}

function handleDefaultCase(selectedBlock: Block, blockHovered: Block, data: Array<Block>) {
    return removeAndMove(data, selectedBlock, blockHovered, selectedBlock);
}

function handleDefaultNonContentMoveCase(selectedBlock: Block, blockHovered: Block, data: Array<Block>) {
    return removeAndMove(data, selectedBlock, blockHovered, selectedBlock);
}
