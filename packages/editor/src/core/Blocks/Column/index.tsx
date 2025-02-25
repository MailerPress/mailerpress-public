import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType} from "../../../constants.ts";
import {
    __experimentalText as Text, Button,
    ColorPalette,
    Panel,
    PanelBody,
    PanelRow, RangeControl,
    SelectControl
} from "@wordpress/components";
import React, {useState} from "react";
import {isEmpty, merge} from "lodash";
import {editBorder} from "../../../utils/function.ts";
import {BorderBox, ColorControl, PaddingControl, Width} from "../../../UI/Settings/index.ts";
import BlockPreview from "../../BlockPreview.tsx";
import BlockRenderer from "../../BlockRenderer.tsx";
import useBlockParams from "../../../hooks/useBlockParams.ts";

const Preview = ({block}) => {
    const {data} = block

    const notContainDefaultPadding = () => {
        return block.attributes['padding-top'] === undefined &&
            block.attributes['padding-right'] === undefined &&
            block.attributes['padding-bottom'] === undefined &&
            block.attributes['padding-left'] === undefined
    }

    if (block.attributes.padding && notContainDefaultPadding()) {
        block.attributes['padding-top'] = block.attributes.padding.top;
        block.attributes['padding-right'] = block.attributes.padding.right;
        block.attributes['padding-bottom'] = block.attributes.padding.bottom;
        block.attributes['padding-left'] = block.attributes.padding.left;
    }

    return <BasicBlock params={block} tag="mj-column">
        {data.content}
    </BasicBlock>;
}

const Edit = (props) => {
    const {block, edit} = useBlockParams({...props})
    const {attributes, data, setAttributes} = block

    return (
        <Panel>
            <PanelBody title="Configuration">
                <PanelRow>
                    <div style={{
                        display: 'flex',
                        flex: 1,
                        gap: 8
                    }}>
                        <div style={{flex: 1}}>
                            <SelectControl
                                label={"Vertical align"}
                                onChange={val => edit({'vertical-align': val})}
                                value={block.attributes['vertical-align']}
                                options={[
                                    {
                                        label: 'Haut',
                                        value: 'top'
                                    },
                                    {
                                        label: 'Centre',
                                        value: 'middle'
                                    },
                                    {
                                        label: 'Bas',
                                        value: 'bottom'
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </PanelRow>
                {/*<PanelRow>*/}
                {/*    <div style={{*/}
                {/*        display: 'flex',*/}
                {/*        flex: 1,*/}
                {/*        gap: 8*/}
                {/*    }}>*/}
                {/*        <div style={{width: '50%'}}>*/}
                {/*            <Button onClick={() => edit({width: '33.333%'})}>1/3</Button>*/}
                {/*            <Button onClick={() => edit({width: '33.333%'})}>1/2</Button>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</PanelRow>*/}
            </PanelBody>
            <PanelBody title={"Dimensions"}>
                <Width
                    min={0}
                    max={100}
                    value={block.attributes.width ? parseInt(block.attributes.width.replace('%', '')) : 100}
                    onChange={val => edit({width: `${val}%`})}
                />
                <PaddingControl {...props} label="Padding"/>
            </PanelBody>
            <PanelBody title="Style" initialOpen={true}>
                <PanelRow>
                    <div
                        style={{
                            flex: 1
                        }}
                    >
                        <BorderBox
                            clientId={block.clientId}
                            attributes={block.attributes}
                            onEdit={val => editBorder(val, setAttributes)}
                        />
                    </div>
                </PanelRow>
                <ColorControl
                    {...props}
                    block={block}
                    attrs={['background-color']}
                    onChange={(val, attr) => edit({[attr]: val})}
                />

                <ColorControl {...props} attrs={['background-color']} la/>
            </PanelBody>
        </Panel>
    )
}

registerBlockType({
    internal: true,
    description: "Display content in multiple columns, with blocks added to each column.",
    type: blockType.COLUMN,
    icon: `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 7.5h-5v10h5v-10Zm1.5 0v10H19a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5h-2.5ZM6 7.5h2.5v10H6a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .5-.5ZM6 6h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"></path></svg>
    `,
    edit: props => <BlockPreview
        {...props}
        render={Edit}
    />,
    preview: props => <BlockRenderer
        {...props}
        render={Preview}
    />,
    name: "Column",
    disabledBlockType: [blockType.COLUMN, blockType.SECTION, blockType.WRAPPER, blockType.HERO, blockType.GROUP],
    init: (payload) => {
        const defaultData = {
            'type': blockType.COLUMN,
            'data': {},
            attributes: {
                'vertical-align': "middle",
                padding: {
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
            children: [],
        }
        return merge(defaultData, payload)
    }
})