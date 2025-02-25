import React, {useMemo} from "react"
import BlockManager from "../BlockManager.ts";
import {set} from "lodash";
import {select} from "@wordpress/data";
import {v4 as uuidv4} from 'uuid';
import {STORE_KEY} from "../../constants.ts";

const MjmlBlock = ({children, type, value, attributes}) => {
    const block = BlockManager.getBlockByType(type);
    if (!block) {
        throw new Error(`Can no find ${type}`);
    }


    const mergeValue = () => {
        if (typeof children === 'string') {
            if (undefined === value) {
                return {
                    content: children,
                };
            } else {
                set(value, '', children);
                return value;
            }
        }

        return value;
    };

    return (
        <>
            {
                block.preview(
                    block.init({
                        attributes,
                        data: mergeValue,
                        childrenComponent: children,
                        clientId: uuidv4()
                    })
                )
            }
        </>
    )
}
export default MjmlBlock