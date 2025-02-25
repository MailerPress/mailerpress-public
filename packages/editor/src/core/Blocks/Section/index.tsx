import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType} from "../../../constants.ts";
import {
    __experimentalBoxControl as BoxControl,
    __experimentalText as Text,
    CheckboxControl,
    ColorPalette,
    Panel,
    PanelBody,
    PanelRow, RangeControl
} from "@wordpress/components";
import React from "react";
import {merge} from "lodash";
import {getAdapterAttributesString} from "../../../utils/getAdapterAttributesString.ts";
import {MjmlToJson} from "../../../utils/MjmlToJson.ts";
import {ColorControl, MediaUpload, PaddingControl} from "../../../UI/Settings/index.ts";
import BlockPreview from "../../BlockPreview.tsx";
import BlockRenderer from "../../BlockRenderer.tsx";
import useBlockParams from "../../../hooks/useBlockParams.ts";

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

    return <BasicBlock params={block} tag="mj-section"/>
}

const Edit = (props) => {
    const {setAttributes} = props
    const {block, edit, activeTab} = useBlockParams({...props})
    const {attributes, data} = block

    return (
        <Panel>
            <PanelBody title="Configuration">
                <CheckboxControl
                    checked={block.attributes['full-width'] === 'full-width'}
                    help="Expand the section backgroun to full width"
                    label="Full width"
                    onChange={val => setAttributes({'full-width': (val ? 'full-width' : '')})}
                />
            </PanelBody>
            <PanelBody title="Dimension">
                <PanelRow>
                    <div
                        style={{
                            flex: 1
                        }}
                    >
                        <PaddingControl
                            {...props}
                            label="Padding"
                            value={attributes.padding}
                            onChange={nextValues => edit({padding: nextValues})}
                        />
                    </div>
                </PanelRow>
            </PanelBody>

            <PanelBody title="Background" initialOpen={true}>
                <PanelRow>
                    <div
                        style={{
                            flex: 1
                        }}
                    >
                        <MediaUpload
                            {...props}
                            onChange={url => {
                                setAttributes({'background-url': url})
                            }
                            }
                            val={block.attributes['background-url']}
                        />
                    </div>
                </PanelRow>
            </PanelBody>
            <PanelBody title="Style" initialOpen={true}>
                <ColorControl {...props} attrs={['background-color']}/>
            </PanelBody>
        </Panel>
    )
}

registerBlockType({
    internal: true,
    description: "The main block for all content",
    icon: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm.5 14c0 .3-.2.5-.5.5H6c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h12c.3 0 .5.2.5.5v12zM7 16.5h6V15H7v1.5zm4-4h6V11h-6v1.5zM9 11H7v1.5h2V11zm6 5.5h2V15h-2v1.5z"></path></svg>
  `,
    type: blockType.SECTION,
    disabledBlockType: [],
    edit: props => <BlockPreview
        {...props}
        render={Edit}
    />,
    preview: props => <BlockRenderer
        {...props}
        render={Preview}
    />,
    name: "Section",
    init: (payload) => {

        const defaultData = {
            'type': blockType.SECTION,
            'data': {
                columnCount: 1
            },
            attributes: {
                'padding': {
                    top: '0px',
                    bottom: '0px',
                    left: '0px',
                    right: '0px'
                },
                'background-position': "center center",
                'background-repeat': "no-repeat",
            },
            children: [],
        }

        if (window.jsVars.defaultBlocksSettings && window.jsVars.defaultBlocksSettings[blockType.SECTION]) {
            return merge(defaultData, window.jsVars.defaultBlocksSettings[blockType.SECTION], payload)
        }

        return merge(defaultData, payload)
    }
})