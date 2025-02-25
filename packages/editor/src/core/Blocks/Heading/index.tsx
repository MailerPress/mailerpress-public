import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType, STORE_KEY} from "../../../constants.ts";
import {merge} from "lodash";
import {useSelect, select} from "@wordpress/data";
import {__experimentalHStack as HStack, Panel, PanelBody} from "@wordpress/components";
import {
    ColorControl,
    InputControl,
    PaddingControl,
    AlignControl,
} from "../../../UI/Settings/index.ts";
import BlockRenderer from "../../BlockRenderer.tsx";
import React, {useMemo} from "react";
import BlockPreview from "../../BlockPreview.tsx";
import useBlockParams from "../../../hooks/useBlockParams.ts";
import ToolBar from "../../../UI/interactive-tooltip/ToolBar.tsx";
import RichText from "../../Toolbar/RichText.tsx";
import {renderHumanWeight} from "../Page";

const Preview = ({block}) => {
    if (
        block.attributes.padding &&
        (
            block.attributes['padding-top'] === undefined ||
            block.attributes['padding-right'] === undefined ||
            block.attributes['padding-bottom'] === undefined ||
            block.attributes['padding-left'] === undefined
        )
    ) {
        block.attributes['padding-top'] = block.attributes.padding.top;
        block.attributes['padding-right'] = block.attributes.padding.right;
        block.attributes['padding-bottom'] = block.attributes.padding.bottom;
        block.attributes['padding-left'] = block.attributes.padding.left;
    }

    const {data} = block
    const store = select(STORE_KEY);
    const fonts = store ? store.getFonts() : {};

    if (
        fonts &&
        fonts['heading'] &&
        (block.attributes['font-weight'] === undefined || block.attributes['font-family'] === undefined)
    ) {
        block = {
            ...block,
            attributes: {
                ...block.attributes,
                'font-family': fonts['heading'].selectedFont,
                'font-weight': fonts['heading'].selectedVariant
            }
        }
    }

    return <BasicBlock params={block} tag="mj-text">
        {data.content}
    </BasicBlock>;
}

const Edit = (props) => {
    const {block, edit} = useBlockParams({...props})
    const {attributes} = block
    const fontsMapping = useSelect((select) => select(STORE_KEY).getFonts(), []);
    const fontsInstalled = useSelect((select) => select(STORE_KEY).getInstalledFont(), []);

    const fontWeights = useMemo(() => {
        if (fontsMapping['heading']) {
            return {...fontsInstalled.core, ...fontsInstalled.installed}[fontsMapping['heading'].selectedFont].reduce((acc, item) => {
                acc.push({
                    label: renderHumanWeight(item),
                    value: item
                })
                return acc
            }, [])
        }

        return [];
    }, [fontsMapping])

    return (
        <>
            <ToolBar.Fill>
                <HStack>
                    <RichText
                        {...props}
                        support={['b', 'i', 'u', 'mergedTag', 's']}
                    />
                </HStack>
            </ToolBar.Fill>
            <Panel>
                <PanelBody title="Configuration">
                    {/*{activeTab === 'desktop' &&*/}
                    {/*    <InputControl*/}
                    {/*        {...props}*/}
                    {/*        label="Text"*/}
                    {/*        value={data.content}*/}
                    {/*        onChange={content => edit({data: {content}})}*/}
                    {/*    />*/}
                    {/*}*/}
                    <AlignControl
                        {...props}
                        label="Align"
                        value={attributes.align}
                        onChange={val => edit({'align': val})}
                    />
                    <PaddingControl
                        {...props}
                        label="Padding"
                        value={attributes.padding}
                        onChange={nextValues => edit({padding: nextValues})}
                    />
                </PanelBody>
                <PanelBody title="Design">
                    <ColorControl
                        {...props}
                        attrs={['color', 'container-background-color']}
                        block={block}
                        onChange={(val, attr) => edit({[attr]: val})}
                    />
                </PanelBody>
            </Panel>
        </>

    )
}

registerBlockType({
    type: blockType.HEADING,
    description: "Introduce new sections and organize content to help readers",
    edit: props => <BlockPreview
        {...props}
        render={Edit}
    />,
    icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M6 5V18.5911L12 13.8473L18 18.5911V5H6Z"></path></svg>    `,
    preview: props => <BlockRenderer
        {...props}
        render={Preview}
    />,
    disabledBlockType: [],
    name: "Heading",
    init:
        (payload) => {
            const defaultData = {
                'type': blockType.HEADING,
                'data': {
                    content: "Heading title"
                },
                attributes: {
                    'font-size': '30px',
                    'align': 'left',
                    'font-style': "normal",
                    padding: {
                        top: '10px',
                        right: '10px',
                        bottom: '10px',
                        left: '10px',
                    },
                    'line-height': "1",
                },
                children: [],
            }

            if (window.jsVars.defaultBlocksSettings && window.jsVars.defaultBlocksSettings[blockType.HEADING]) {
                return merge(defaultData, window.jsVars.defaultBlocksSettings[blockType.HEADING], payload)
            }

            return merge(defaultData, payload)
        }
})