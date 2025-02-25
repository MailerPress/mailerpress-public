import React from "react"
import {getAdapterAttributesString} from "../utils/getAdapterAttributesString.ts";
import {BlockRenderer} from "./BlockRenderer.tsx";
import {getPlaceholder} from "../utils/block.ts";

const BasicBlock = (props: {
    params: object;
    tag: string;
    children?: React.ReactNode;
}) => {
    const {
        params,
        tag,
        children,
    } = props;

    let childs = params.children

    const placeholder = params.children.length === 0 && getPlaceholder(params.type);

    return (
            <>
                {`<${tag} ${getAdapterAttributesString(params)}>`}
                {
                    (children !== undefined || props.params.childrenComponent)
                        ? children || props.params.childrenComponent
                        : placeholder || childs.map((child, index) => (
                        <BlockRenderer
                            key={index}
                            data={child}
                        />
                    ))
                }
                {`</${tag}>`}
            </>
    );
}
export default BasicBlock