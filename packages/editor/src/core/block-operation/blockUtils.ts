import BlockManager from "../BlockManager.ts";
import {blockType as blockTypeEnum} from '../../constants.ts';
import {v4 as uuidv4} from 'uuid';
import BlockGenerator from "../BlockGenerator.ts";
import {
    handleColumnCase,
    handleContentCase, handleQueryCase,
    handleSectionCase,
    handleWrapperCase
} from "./blockMoveHandlers.ts";

export function initializeBlocks() {
    BlockGenerator.section = initBlock(blockTypeEnum.SECTION);
    BlockGenerator.column = initBlock(blockTypeEnum.COLUMN);
    BlockGenerator.text = initBlock(blockTypeEnum.TEXT);
}

export function initBlock(type: blockTypeEnum) {
    return BlockManager.getBlockByType(type).init({clientId: uuidv4()});
}

export function getHandlerForType(type: blockTypeEnum) {
    const handlers = {
        [blockTypeEnum.WRAPPER]: handleWrapperCase,
        [blockTypeEnum.SECTION]: handleSectionCase,
        [blockTypeEnum.COLUMN]: handleColumnCase,
        [blockTypeEnum.TEXT]: handleContentCase,
        [blockTypeEnum.BUTTON]: handleContentCase,
        [blockTypeEnum.DIVIDER]: handleContentCase,
    };
    return handlers[type];
}
