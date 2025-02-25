import BlockManager from "../core/BlockManager.ts";
import {STORE_KEY} from "../constants.ts";
import {select} from "@wordpress/data";

export const PatternRenderer = (props) => {
    const {data} = props;
    if (data.data && data.data.hidden) return null;
    const Block = (BlockManager.getPatternById(data.id) || BlockManager.getQueryPatternById(data.id));
    if (!Block) return null;

    const store = select(STORE_KEY);
    const fonts = store ? store.getFonts() : {};


    return <Block.preview {...data} />
};