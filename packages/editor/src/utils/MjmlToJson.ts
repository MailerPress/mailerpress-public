import {blockType} from "../constants.ts";
import {v4 as uuidv4} from 'uuid';
import mjml from 'mjml-browser';
import BlockManager from "../core/BlockManager.ts";
import {isString} from 'lodash';

const domParser = new DOMParser();

interface MjmlBlockItem {
    file: string;
    absoluteFilePath: string;
    line: number;
    includedIn: any[];
    tagName: string;
    children: IChildrenItem[];
    attributes: IAttributes;
    content?: string;
}

export function MjmlToJson(data: MjmlBlockItem | string) {
    if (isString(data)) return parseXMLtoBlock(data);

    const transform = (item) => {
        const attributes = item.attributes as any;

        switch (item.tagName) {
            case 'mjml':
                const body = item.children?.find((item) => item.tagName === 'mj-body')!
                return BlockManager.getBlockByType(blockType.PAGE)!.init({
                    clientId: "page",
                    attributes: body.attributes,
                    children: body.children?.map(transform),
                    data: {},
                });

            default:
                const tag = item.tagName.replace('mj-', '').toLowerCase();

                const block = BlockManager.getBlockByType(tag);
                if (!block) {
                    throw new Error(`${tag} block no found `);
                }
                const payload = {
                    type: block.type,
                    clientId: uuidv4(),
                    attributes: attributes,
                    data: {},
                    children: [],
                };

                if (item.content) {
                    payload.data.content = item.content;
                }

                switch (block.type) {
                    case blockType.SOCIAL:
                        payload.data.elements =
                            item.children?.map((child) => {
                                return {
                                    ...child.attributes,
                                    content: child.content,
                                };
                            }) || [];
                        payload.children = [];
                        break;
                    default :
                        payload.children = item.children?.map(transform);
                        break;
                }


                const blockData = block.init(payload);

                // format padding
                formatPadding(blockData.attributes, 'padding');
                formatPadding(blockData.attributes, 'inner-padding');
                return blockData;
        }
    };

    return transform(data);
}

export function parseXMLtoBlock(text: string) {
    const dom = domParser.parseFromString(text, 'text/xml');
    const root = dom.firstChild as Element;
    if (!(dom.firstChild instanceof Element)) {
        throw new Error('Invalid content');
    }
    if (root.tagName === 'mjml') {

        const {json} = mjml(text, {
            validationLevel: 'soft',
        });
        const parseValue = MjmlToJson(json);
        return parseValue;
    }

    const transform = (node: Element) => {
        // if (node.tagName === 'parsererror') {
        //     throw new Error('Invalid content');
        // }
        const attributes = {};
        node.getAttributeNames().forEach((name) => {
            attributes[name] = node.getAttribute(name);
        });
        const type = node.tagName.replace('mj-', '');

        // if (!BlockManager.getBlockByType(type)) {
        //     if (!node.parentElement || node.parentElement.tagName !== 'mj-text')
        //         throw new Error('Invalid content');
        // }

        const block = {
            type: type as blockType,
            attributes: attributes,
            data: {
            },
            children: [...node.children]
                .filter((item) => item instanceof Element)
                .map(transform as any),
        };

        switch (type) {
            case blockType.TEXT:
                block.data.content = node.innerHTML;
                block.children = [];
            case blockType.BUTTON:
                block.data.content = node.innerHTML;
                block.children = [];
        }

        return block;
    };
    return transform(root);
}

function formatPadding(
    attributes: {},
    attributeName: 'padding' | 'inner-padding'
) {
    const ele = document.createElement('div');
    Object.keys(attributes).forEach((key: string) => {
        if (new RegExp(`^${attributeName}`).test(key)) {
            const formatKey = new RegExp(`^${attributeName}(.*)`).exec(key)?.[0];

            if (formatKey) {
                ele.style[formatKey as any] = attributes[key];
                delete attributes[key];
            }
        }
    });
    const newPadding = [
        ele.style.paddingTop,
        ele.style.paddingRight,
        ele.style.paddingBottom,
        ele.style.paddingLeft,
    ]
        .filter(Boolean)
        .join(' ');

    if (newPadding) {
        attributes[attributeName] = newPadding;
    }
}