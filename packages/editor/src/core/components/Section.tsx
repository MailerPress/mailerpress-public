import {omit} from 'lodash';
import MjmlBlock from "./MjmlBlock.tsx";
import {blockType} from "../../constants.ts";

export function Section(props) {
    return <MjmlBlock
        attributes={omit(props, ['data', 'children', 'value'])}
        type={blockType.SECTION}
        value={props.value}
    >
        {props.children}
    </MjmlBlock>
}
