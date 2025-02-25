import BlockManager from "../core/BlockManager.ts";

export const BlockRenderer = (props) => {
    const {data} = props;
    if (data) {
        if (data && data.data && data.data.hidden) return null;
        const Block = data.id !== undefined ? (BlockManager.getPatternById(data.id) || BlockManager.getQueryPatternById(data.id)) : BlockManager.getBlockByType(data.type);
        if (!Block) return null;

        return <Block.preview {...data} previewMode={props.previewMode} />;
    }

    return null

};