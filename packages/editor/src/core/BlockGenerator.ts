import {blockType} from "./regisetBlockType.ts";
import Block from "../interfaces/block.ts";
import {
    contentBlocks,
} from "../utils/block.ts";
import {initializeBlocks} from "./block-operation/blockUtils.ts";
import {handleContentBlockMove, handleNonContentBlockMove} from "./block-operation/blockMoveHandlers.ts";
import {generateContentBlock} from "./block-operation/blockGeneration.ts";

export default class BlockGenerator {
    public static section;
    public static column;
    public static text;

    public static generate(block: blockType, selectedBlock: Block) {
        initializeBlocks();
        return block.disabledBlockType.length === 0
            ? generateContentBlock(block, selectedBlock)
            : null;
    }

    public static move(selectedBlock: Block, blockHovered: Block, data: Array<Block>) {
        initializeBlocks();
        const handler = contentBlocks.includes(selectedBlock.type)
            ? handleContentBlockMove
            : handleNonContentBlockMove;

        return handler(selectedBlock, blockHovered, data);
    }
}
