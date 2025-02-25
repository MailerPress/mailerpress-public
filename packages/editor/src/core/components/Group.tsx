import {omit} from 'lodash';
import MjmlBlock from "./MjmlBlock.tsx";
import {blockType} from "../../constants.ts";

export function Group(props) {
    return <MjmlBlock
        attributes={omit(props, ['data', 'children', 'value'])}
        type={blockType.GROUP}
        value={props.value}
    >
        {props.children}
    </MjmlBlock>
}
