import {classnames} from "./classnames.ts";
import {EMAIL_BLOCK_CLASS_NAME} from "../constants.ts";
import {getNodeTypeClassName} from "./block.ts";
import {isString} from 'lodash';

export function getAdapterAttributesString(
    params,
    aditionalClasses = ''
) {
    const attributes = {...params.attributes};
    attributes['css-class'] = classnames(
        attributes['css-class'],
        EMAIL_BLOCK_CLASS_NAME,
        getNodeTypeClassName(params.type),
        `node-client-${params.clientId}`,
        aditionalClasses
    );


    let attributeStr = '';
    for (let key in attributes) {
        const keyName = key as keyof typeof attributes;
        const val = attributes[keyName];
        if (isString(val) && val) {
            const splitter = ' ';
            attributeStr += `${key}="${val.replace(/"/gm, '')}"` + splitter;
        }
    }

    return attributeStr;
}

export function getPreviewClassName(clientId: string) {
    return `block-pattern node-client-${clientId}`
}