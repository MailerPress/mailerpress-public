import {blockType as blockTypeEnum} from '../../constants.ts';
import {v4 as uuidv4} from 'uuid';
import Block from "../../interfaces/block.ts";
import BlockManager from "../BlockManager.ts";
import {blockType} from "../../constants.ts";

export function generateContentBlock(block: blockType, selectedBlock: Block, move = false) {
    const generator = {
        [blockTypeEnum.WRAPPER]: () => generateBlockInsideWrapper(block, move),
        [blockTypeEnum.SECTION]: () => generateBlockInsideSection(block, move),
        [blockTypeEnum.COLUMN]: () => generateBlockInsideColumn(block, move),
    }[selectedBlock.type];

    return generator ? generator() : null;
}

export function moveColumnBlock(block: blockType, move = false) {
    return BlockManager.getBlockByType(blockTypeEnum.SECTION).init({
        clientId: uuidv4(),
        children: [createBlock(block, move)]
    });
}

export function putInsideWrapper(block: blockType, move = false) {
    return BlockManager.getBlockByType(blockTypeEnum.WRAPPER).init({
        clientId: uuidv4(),
        children: [createBlock(block, move)]
    });
}

export function generateBlockInsideWrapper(block: blockType, move = false) {
    return BlockManager.getBlockByType(blockTypeEnum.SECTION).init({
        clientId: uuidv4(),
        children: [{
            ...BlockManager.getBlockByType(blockTypeEnum.COLUMN).init({clientId: uuidv4()}),
            children: [createBlock(block, move)]
        }]
    });
}

export function generateBlockInsideSection(block: blockType, move = false) {
    return BlockManager.getBlockByType(blockTypeEnum.COLUMN).init({
        clientId: uuidv4(),
        children: [createBlock(block, move)]
    });
}

export function generateBlockInsideColumn(block: blockType, move = false) {
    return createBlock(block, move);
}

function createBlock(block: blockType, move: boolean) {
    return move ? {...block, clientId: uuidv4()} : block.init({clientId: uuidv4()});
}
