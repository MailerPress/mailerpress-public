import {omit} from 'lodash';
import MjmlBlock from "./MjmlBlock.tsx";
import {blockType} from "../../constants.ts";

export function Column(props) {
    return <MjmlBlock
        attributes={omit(props, ['data', 'children', 'value'])}
        type={blockType.COLUMN}
        value={props.value}
    >
        {props.children}
    </MjmlBlock>
}
