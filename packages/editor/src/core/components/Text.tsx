import {omit} from 'lodash';
import MjmlBlock from "./MjmlBlock.tsx";
import {blockType} from "../../constants.ts";

export function Text(props) {
    return <MjmlBlock
        attributes={omit(props, ['data', 'children', 'value'])}
        type={blockType.TEXT}
        value={props.value}
    >
        {props.children}
    </MjmlBlock>
}
