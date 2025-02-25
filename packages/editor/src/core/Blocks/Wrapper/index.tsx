import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType, PLACEHOLDER_IMAGE} from "../../../constants.ts";
import {merge} from "lodash";
import {__} from "@wordpress/i18n";
import {CheckboxControl, Panel, PanelBody, RangeControl} from "@wordpress/components";
import React from "react";
import {
    BackgroundPosition,
    BorderBox,
    ColorControl,
    MediaUpload,
    PaddingControl,
    SelectControl
} from "../../../UI/Settings/index.ts";
import {editBorder} from "../../../utils/function.ts";
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
    return <BasicBlock params={block} tag="mj-wrapper"/>;
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
                    help="Expand the wrapper background to full width"
                    label="Full width"
                    onChange={val => setAttributes({'full-width': (val ? 'full-width' : '')})}
                />
            </PanelBody>
            <PanelBody title="Dimensions">
                <PaddingControl
                    {...props}
                    label={__('Padding', 'mailerpress')}
                    value={attributes.padding}
                    onChange={nextValues => edit({padding: nextValues})}
                />
            </PanelBody>
            <PanelBody title="Style" initialOpen={true}>
                <BorderBox
                    {...props}
                    clientId={props.block.clientId}
                    attributes={props.block.attributes}
                    onEdit={val => editBorder(val, setAttributes)}
                />
                <ColorControl {...props} attrs={['background-color']}/>
                <MediaUpload
                    {...props}
                    onChange={url => setAttributes({'background-url': url})}
                    val={block.attributes['background-url']}
                />
                <SelectControl
                    label={"Background repeat"}
                    options={[
                        {'label': 'Repeat', value: 'repeat'},
                        {'label': 'No repeat', value: 'no-repeat'},
                    ]}
                    onChange={val => setAttributes({'background-repeat': val})}
                    value={block.attributes['background-repeat']}
                />
                <SelectControl
                    label={"Background size"}
                    options={[
                        {'label': 'Contain', value: 'contain'},
                        {'label': 'Cover', value: 'Cover'},
                    ]}
                    onChange={val => setAttributes({'background-size': val})}
                    value={block.attributes['background-size']}
                />
                {block.attributes['background-url'] !== PLACEHOLDER_IMAGE &&
                    <BackgroundPosition
                        label="Positionement de l'image"
                        url={block.attributes['background-url']}
                        onChange={(focalPoint) => {
                            setAttributes({'background-position': `${focalPoint.x * 100}% ${focalPoint.y * 100}%`})
                        }}
                    />
                }
            </PanelBody>
        </Panel>
    )
}

registerBlockType({
    type: blockType.WRAPPER,
    description: "Gather multiple sections in a container.",
    icon: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M18 4h-7c-1.1 0-2 .9-2 2v3H6c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h7c1.1 0 2-.9 2-2v-3h3c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4.5 14c0 .3-.2.5-.5.5H6c-.3 0-.5-.2-.5-.5v-7c0-.3.2-.5.5-.5h3V13c0 1.1.9 2 2 2h2.5v3zm0-4.5H11c-.3 0-.5-.2-.5-.5v-2.5H13c.3 0 .5.2.5.5v2.5zm5-.5c0 .3-.2.5-.5.5h-3V11c0-1.1-.9-2-2-2h-2.5V6c0-.3.2-.5.5-.5h7c.3 0 .5.2.5.5v7z"></path></svg>
    `,
    edit: props => <BlockPreview
        {...props}
        render={Edit}
    />,
    preview: props => <BlockRenderer
        {...props}
        render={Preview}
    />,
    name: "Wrapper",
    disabledBlockType: [],
    init: (payload) => {
        const defaultData = {
            'type': blockType.WRAPPER,
            'data': {},
            attributes: {
                'padding': {
                    top: '0px',
                    bottom: '0px',
                    left: '0px',
                    right: '0px'
                },
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
            },
            children: [],
        }
        return merge(payload, defaultData)
    }
})