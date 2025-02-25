import {omit} from 'lodash';
import MjmlBlock from "./MjmlBlock.tsx";
import {blockType} from "../../constants.ts";

export function Button(props) {
    return <MjmlBlock
        attributes={omit(props, ['data', 'children', 'value'])}
        type={blockType.BUTTON}
        value={props.value}
    >
        {props.children}
    </MjmlBlock>
}
