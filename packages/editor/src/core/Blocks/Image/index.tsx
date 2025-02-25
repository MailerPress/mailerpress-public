import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType, PLACEHOLDER_IMAGE, STORE_KEY} from "../../../constants.ts";
import {merge} from "lodash";
import {__experimentalBorderRadiusControl as BorderRadiusControl} from "@wordpress/block-editor";
import {
    Panel,
    PanelBody,
    PanelRow,
    RangeControl,
    SelectControl, ToolbarButton, Popover, MenuGroup, MenuItem, Notice, TabPanel
} from "@wordpress/components";
import {editBorderRadius, t} from "../../../utils/function.ts";
import {AlignControl, BorderBox, MediaUpload, PaddingControl} from "../../../UI/Settings/index.ts";
import ToolBar from "../../../UI/interactive-tooltip/ToolBar.tsx";
import React, {useState} from "react";
import {media} from "@wordpress/icons";
import {useMedia} from "../../../hooks/useMedia.ts";
import {AiImageGenerator} from "../../../UI/Settings/MediaUpload.tsx";
import {useDispatch} from "@wordpress/data";
import useBlockParams from "../../../hooks/useBlockParams.ts";
import BlockPreview from "../../BlockPreview.tsx";
import BlockRenderer from "../../BlockRenderer.tsx";
import {__} from "@wordpress/i18n";

const Preview = ({block}) => {
    const {data} = block

    if (block.attributes.padding) {
        block.attributes['padding-top'] = block.attributes.padding.top;
        block.attributes['padding-right'] = block.attributes.padding.right;
        block.attributes['padding-bottom'] = block.attributes.padding.bottom;
        block.attributes['padding-left'] = block.attributes.padding.left;
    }


    return <BasicBlock params={block} tag="mj-image">
        {data.content}
    </BasicBlock>;
}

const Edit = (props) => {
    const {setAttributes} = props;
    const {open, state} = useMedia();
    const {setModal} = useDispatch(STORE_KEY)
    const {block, edit} = useBlockParams({...props})
    const {attributes} = block
    const [isOpen, setIsOpen] = useState(false)

    const onSelect = val => {
        setModal(null)
        setAttributes({src: val})
    }

    const onChange = val => {
        if (undefined !== val) {
            edit(val)
        }
    }

    const ImageWithAi = () => {
        setModal({
            title: 'Generate image with AI',
            component: jsVars.gptAi !== '' ? <AiImageGenerator onSelectImage={onSelect}/> : <Notice
                status={"warning"}
                isDismissible={false}
                actions={[
                    {
                        label: __('Before using AI you must add your API key in the options TAB', 'mailerpress'),
                        variant: 'secondary',
                        url: `${jsVars.adminUrl}?page=mailpress/campaigns.php&activeTab=3`
                    }
                ]}
            />
        })
    }

    const buildValues = val => {
        if (val) {
            const split = val.split(' ')
            if (split.length === 1) {
                return {
                    topLeft: val.replace('px', ''),
                    topRight: val.replace('px', ''),
                    bottomRight: val.replace('px', ''),
                    bottomLeft: val.replace('px', ''),
                }
            } else {
                console.log(split)
                return {
                    topLeft: split[0].replace('px', ''),
                    topRight: split[1].replace('px', ''),
                    bottomRight: split[3].replace('px', ''),
                    bottomLeft: split[2].replace('px', ''),
                }
            }
        }
    }

    return (
        <>
            <ToolBar.Fill>
                <ToolbarButton onClick={() => setIsOpen(!isOpen)}>
                    Replace
                </ToolbarButton>
                {isOpen &&
                    <Popover focusOnMount={false} offset={6}>
                        <div style={{padding: 12}}>
                            <MenuGroup>
                                <MenuItem icon={media} onClick={open}>
                                    Open media library
                                </MenuItem>
                                <MenuItem icon={media} onClick={ImageWithAi}>
                                    Generate with AI
                                </MenuItem>
                            </MenuGroup>
                        </div>
                    </Popover>
                }
            </ToolBar.Fill>
            <Panel>
                <PanelBody title="Configuration">
                    <PanelRow>
                        <div
                            style={{
                                flex: 1,
                                maxWidth: '100%'
                            }}
                        >
                            <MediaUpload
                                {...props}
                                onChange={(url) => onChange({src: url})}
                                val={block.attributes.src}
                            />
                        </div>
                    </PanelRow>
                    <PanelRow>
                        <div
                            style={{
                                flex: 1,
                                maxWidth: '100%'
                            }}
                        >
                            <RangeControl
                                value={
                                    block.attributes.width ? Math.round(parseInt(block.attributes.width.replace('px', '')) * 100 / block.data.width) : 0
                                }
                                disabled={PLACEHOLDER_IMAGE === block.attributes.src}
                                label="Image width"
                                max={100}
                                min={0}
                                onChange={val =>
                                    onChange({width: `${parseInt(block.data.width) * val / 100}px`})
                                }
                            />
                        </div>
                    </PanelRow>
                    <PanelRow>
                        <div
                            style={{
                                flex: 1,
                                maxWidth: '100%'
                            }}
                        >
                            <SelectControl
                                value={block.data.width}
                                onChange={val => {
                                    onChange({
                                        data: {"width": val},
                                        attributes: {width: `${val}px`}
                                    })
                                }}
                                options={Object.entries(jsVars.imagesSizes).reduce((acc, item) => {
                                    acc.push({
                                        label: `${item[0]} - (${item[1].width}x${item[1].height}`,
                                        value: item[1].width,
                                        disabled: PLACEHOLDER_IMAGE === block.attributes.src
                                    })
                                    return acc
                                }, [])}
                            />
                        </div>
                    </PanelRow>
                </PanelBody>
                <PanelBody title="Placement">
                    <AlignControl
                        value={block.attributes.align}
                        {...props}
                        label={"Align image"}
                        onChange={align => edit({align})}
                    />
                </PanelBody>
                <PanelBody title="Design">
                    <PanelRow>
                        <div
                            style={{
                                flex: 1
                            }}
                        >
                            <BorderRadiusControl
                                values={buildValues(attributes['border-radius'])}
                                onChange={value => onChange({'border-radius': editBorderRadius(value)})}
                            />

                            {/*<BorderBox*/}
                            {/*    clientId={block.clientId}*/}
                            {/*    attributes={block.attributes}*/}
                            {/*    onEdit={val => onChange(editBorder(val))}*/}
                            {/*/>*/}
                        </div>
                    </PanelRow>
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
            </Panel>
        </>
    )
}

registerBlockType({
    type: blockType.IMAGE,
    description: "Insert an image to make a visual statement.",
    icon:
        `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11.9 14 9 12c-.3-.2-.6-.2-.8 0l-3.6 2.6V5c-.1-.3.1-.5.4-.5zm14 15H5c-.3 0-.5-.2-.5-.5v-2.4l4.1-3 3 1.9c.3.2.7.2.9-.1L16 12l3.5 3.4V19c0 .3-.2.5-.5.5z"></path></svg>
    `,
    edit: props => <BlockPreview
        {...props}
        render={Edit}
    />,
    preview: props => <BlockRenderer
        {...props}
        render={Preview}
    />,
    name: "Image",
    disabledBlockType: [],
    init: (payload) => {
        const defaultData = {
            'type': blockType.IMAGE,
            'data': {},
            attributes: {
                'align': "left",
                'src': PLACEHOLDER_IMAGE,
                padding: {
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
                'fluid-on-mobile': true,
            },
            children: [],
        }
        return merge(defaultData, payload)
    }
})