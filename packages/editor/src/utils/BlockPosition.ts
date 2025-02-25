import {blockType, blockType as blockTypeEnum} from "../constants.ts";
import {blockType as IBlockType} from "../core/regisetBlockType.ts";

export default class BlockPosition {
    public static getPosition(path, blockDragged: IBlockType) {
        let position = null

        if (blockDragged === undefined) {
            return position
        }

        switch (blockDragged.type) {
            case 'pattern':
                position = this.getPatternPosition(path, blockDragged)
                break;
            case 'layout':
            case blockTypeEnum.SECTION:
            case blockTypeEnum.WRAPPER:
            case blockTypeEnum.QUERY:
                position = this.getSectionPosition(path, blockDragged);
                break;
            case blockTypeEnum.COLUMN:
                position = this.getColumnPosition(path, blockDragged);
                break;
            default:
                position = this.getDefaultPosition(path, blockDragged);
                break;
        }

        return position
    }

    private static getPatternPosition(path, blockDragged: IBlockType) {
        if (path.find(p => p.type === 'wrapper')) {
            return path.find(p => p.type === blockTypeEnum.WRAPPER || p.type === 'pattern' || p.type === blockTypeEnum.QUERY);
        } else {
            return path.find(p => p.type === blockTypeEnum.SECTION || p.type === blockTypeEnum.WRAPPER || p.type === 'pattern' || p.type === blockTypeEnum.QUERY);
        }
    }

    private static getColumnPosition(path, blockDragged: IBlockType) {
        return path.find(p => p.type === blockTypeEnum.COLUMN || p.type === blockTypeEnum.SECTION || p.type === blockTypeEnum.WRAPPER || p.type === 'pattern' || p.type === blockTypeEnum.QUERY);
    }

    private static getSectionPosition(path, blockDragged: IBlockType) {

        if (
            blockDragged.type === blockTypeEnum.QUERY &&
            path.find(p => p.type === blockTypeEnum.WRAPPER)
        ) {
            if(path.find(p => p.type === 'query-pattern')) {
                return path.find(p => p.type === blockTypeEnum.QUERY)
            } else {
                return path.find(p => p.type === blockTypeEnum.WRAPPER || p.type === blockTypeEnum.SECTION || p.type === blockTypeEnum.QUERY || p.type === 'query-pattern')
            }
        }

        return path.find(p => (
            p.type === blockTypeEnum.SECTION || p.type === blockTypeEnum.WRAPPER || p.type === 'pattern' || p.type === blockTypeEnum.QUERY
        ));
    }

    private static getDefaultPosition(path, blockDragged: IBlockType) {
        if (path.length > 1 && path.find(p => (p.type === blockTypeEnum.COLUMN))) {
            return path[0]
        } else {
            return this.getSectionPosition(path, blockDragged);
        }
    }
}