import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType, STORE_KEY} from "../../../constants.ts";
import {merge, omit} from "lodash";
import {Panel, PanelBody, __experimentalHStack as HStack} from "@wordpress/components";
import {
    BorderBox,
    ColorControl,
    InputControl,
    PaddingControl,
    FontSize,
    AlignControl,
    InnerPadding,
    BorderRadius, WidthHeight
} from "../../../UI/Settings/index.ts";
import {editBorder} from "../../../utils/function.ts";
import BlockPreview from "../../BlockPreview.tsx";
import React from "react";
import useBlockParams from "../../../hooks/useBlockParams.ts";
import BlockRenderer from "../../BlockRenderer.tsx";
import RichText from "../../Toolbar/RichText.tsx";
import ToolBar from "../../../UI/interactive-tooltip/ToolBar.tsx";
import {select} from "@wordpress/data";

const Preview = ({block,}) => {
    const {data} = block
    const store = select(STORE_KEY);
    const fonts = store ? store.getFonts() : {};
    if (block.attributes.padding) {
        block.attributes['padding-top'] = block.attributes.padding.top;
        block.attributes['padding-right'] = block.attributes.padding.right;
        block.attributes['padding-bottom'] = block.attributes.padding.bottom;
        block.attributes['padding-left'] = block.attributes.padding.left;
    }

    if (
        fonts &&
        fonts['button'] &&
        (block.attributes['font-weight'] === undefined && block.attributes['font-family'] === undefined)
    ) {
        block = {
            ...block,
            attributes: {
                ...block.attributes,
                'font-family': fonts['button'].selectedFont,
                'font-weight': fonts['button'].selectedVariant
            }
        }
    }

    return <BasicBlock params={block} tag="mj-button">
        {data.content}
    </BasicBlock>;
}

const Edit = (props) => {
    const {block, edit} = useBlockParams({...props})
    const {attributes, data} = block

    return (
        <>
            <ToolBar.Fill>
                <HStack>
                    <RichText
                        {...props}
                        support={['b', 'i', 'u', 's']}
                    />
                </HStack>
            </ToolBar.Fill>
            <Panel>
                <PanelBody title="Configuration">
                    <InputControl
                        {...props}
                        label="Text"
                        onChange={content => edit({data: {content}})}
                    />
                    <InputControl
                        {...props}
                        label="URL"
                        value={attributes.href}
                        onChange={val => edit({href: val})}
                    />
                    <AlignControl
                        {...props}
                        label="Align"
                        value={attributes.align}
                        onChange={val => edit({'align': val})}
                    />
                    <InnerPadding {...props} />
                    <PaddingControl
                        {...props}
                        label="Padding"
                        value={attributes.padding}
                        onChange={nextValues => edit({padding: nextValues})}
                    />
                </PanelBody>
                <PanelBody title="Dimension">
                    <WidthHeight {...props} />
                </PanelBody>
                <PanelBody title="Typographie">
                    <FontSize {...props} />
                </PanelBody>
                <PanelBody title="Design">
                    <ColorControl
                        {...props}
                        block={block}
                        attrs={['color', 'background-color', 'container-background-color']}
                        onChange={(val, attr) => edit({[attr]: val})}
                    />
                    <BorderRadius {...props} label={"Border radius"}/>
                    <BorderBox
                        clientId={props.block.clientId}
                        attributes={props.block.attributes}
                        onEdit={val => editBorder(val, props.setAttributes)}
                    />
                </PanelBody>
            </Panel>
        </>
    )
}

registerBlockType({
    type: blockType.BUTTON,
    edit: props => <BlockPreview
        {...props}
        render={Edit}
    />,
    preview: props => <BlockRenderer
        {...props}
        render={Preview}
    />,
    description: "Prompt visitors to take action with a button-style link.",
    icon: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M14.5 17.5H9.5V16H14.5V17.5Z M14.5 8H9.5V6.5H14.5V8Z M7 3.5H17C18.1046 3.5 19 4.39543 19 5.5V9C19 10.1046 18.1046 11 17 11H7C5.89543 11 5 10.1046 5 9V5.5C5 4.39543 5.89543 3.5 7 3.5ZM17 5H7C6.72386 5 6.5 5.22386 6.5 5.5V9C6.5 9.27614 6.72386 9.5 7 9.5H17C17.2761 9.5 17.5 9.27614 17.5 9V5.5C17.5 5.22386 17.2761 5 17 5Z M7 13H17C18.1046 13 19 13.8954 19 15V18.5C19 19.6046 18.1046 20.5 17 20.5H7C5.89543 20.5 5 19.6046 5 18.5V15C5 13.8954 5.89543 13 7 13ZM17 14.5H7C6.72386 14.5 6.5 14.7239 6.5 15V18.5C6.5 18.7761 6.72386 19 7 19H17C17.2761 19 17.5 18.7761 17.5 18.5V15C17.5 14.7239 17.2761 14.5 17 14.5Z"></path></svg>
    `,
    disabledBlockType:
        [],
    name:
        "Button",
    init:
        (payload) => {
            const defaultData = {
                'type': blockType.BUTTON,
                'data': {
                    content: "Click Me"
                },
                attributes: {
                    align: 'left',
                    'padding-top': "10px",
                    'padding-right': "10px",
                    'padding-bottom': "10px",
                    'padding-left': "10px",
                    'font-size': "16px",
                    'inner-padding': "8px 8px 8px 8px",
                    'href': ''
                },
                children: [],
            }
            if (window.jsVars.defaultBlocksSettings && window.jsVars.defaultBlocksSettings[blockType.BUTTON]) {
                return merge(defaultData, window.jsVars.defaultBlocksSettings[blockType.BUTTON], payload)
            }

            return merge(defaultData, payload)
        }
})