import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType, STORE_KEY} from "../../../constants.ts";
import {
    Panel,
    PanelBody,
    PanelRow,
    TextareaControl,
    __experimentalHStack as HStack,
    FontSizePicker,
    SelectControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    ToolbarDropdownMenu, ToolbarButton
} from "@wordpress/components";
import {
    LineHeightControl
} from '@wordpress/block-editor';
import {
    __
} from '@wordpress/i18n';
import {merge} from "lodash";
import {useSelect} from "@wordpress/data";
import {ColorControl, PaddingControl} from "../../../UI/Settings/index.ts";
import React, {useEffect, useMemo, useRef, useState} from "react";
import ToolBar from "../../../UI/interactive-tooltip/ToolBar.tsx";
import {
    alignCenter,
    alignJustify,
    alignLeft,
    alignRight
} from "@wordpress/icons";
import BlockPreview from "../../BlockPreview.tsx";
import useBlockParams from "../../../hooks/useBlockParams.ts";
import BlockRenderer from "../../BlockRenderer.tsx";
import RichText from "../../Toolbar/RichText.tsx";
import {renderHumanWeight} from "../Page";
import {select} from "@wordpress/data";

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
        fonts['text'] &&
        (block.attributes['font-weight'] === undefined && block.attributes['font-family'] === undefined)
    ) {
        block = {
            ...block,
            attributes: {
                ...block.attributes,
                'font-family': fonts['text'].selectedFont,
                'font-weight': fonts['text'].selectedVariant
            }
        }
    }

    return <BasicBlock params={block} tag="mj-text">
        {data.content}
    </BasicBlock>;
}

const Edit = (props) => {
    const {setAttributes} = props
    const {block, edit, activeTab} = useBlockParams({...props})
    const {attributes, data} = block
    const selectedBlock = useSelect((select) => select(STORE_KEY).getSelectedBlock(), null);
    const fontsMapping = useSelect((select) => select(STORE_KEY).getFonts(), []);
    const fontsInstalled = useSelect((select) => select(STORE_KEY).getInstalledFont(), []);
    const [activeBlockFont, setActiveBlockFont] = useState(attributes['font-family'])
    const fontWeights = useMemo(() => {
        console.log({...fontsInstalled.core, ...fontsInstalled.installed})
        if ({...fontsInstalled.core, ...fontsInstalled.installed}[activeBlockFont]) {
            return {...fontsInstalled.core, ...fontsInstalled.installed}[activeBlockFont].reduce((acc, item) => {
                acc.push({
                    label: renderHumanWeight(item),
                    value: item
                })
                return acc
            }, [])
        }

        if ({...fontsInstalled.core, ...fontsInstalled.installed}[fontsMapping['text'].selectedFont]) {
            return {...fontsInstalled.core, ...fontsInstalled.installed}[fontsMapping['text'].selectedFont].reduce((acc, item) => {
                acc.push({
                    label: renderHumanWeight(item),
                    value: item
                })
                return acc
            }, [])
        }

        return [];

    }, [fontsMapping, activeBlockFont])
    const getDefaultIcon = () => {
        let icon = alignLeft;

        switch (block.attributes.align) {
            case 'center':
                icon = alignCenter
                break;
            case 'right':
                icon = alignRight
                break;
            case 'justify':
                icon = alignJustify
                break;
        }

        return icon
    }

    const fontsAvailable = useMemo(() => {
        return Object.keys({...fontsInstalled.core, ...fontsInstalled.installed}).reduce((acc, item) => {
            acc.push({
                label: item,
                value: item
            })
            return acc
        }, []);

    }, [])

    const getActiveFont = useMemo(() => {
        if (attributes['font-family']) {
            return attributes['font-family']
        }

        return fontsMapping['text'].selectedFont
    }, [attributes, fontsMapping]);

    useEffect(() => {
        const weight = attributes['font-weight'];
        const family = attributes['font-family'];
        if (false === Object.values({...fontsInstalled.core, ...fontsInstalled.installed}).includes(weight) && family !== undefined) {
            edit({'font-weight': {...fontsInstalled.core, ...fontsInstalled.installed}[family][0]})
        }

    }, [attributes['font-family']]);

    useEffect(() => {
        setActiveBlockFont(activeBlockFont)
    }, [activeBlockFont]);

    return (
        <>
            <ToolBar.Fill>
                <HStack>
                    <RichText
                        {...props}
                        editable={selectedBlock}
                    />
                    <ToolbarDropdownMenu
                        controls={[
                            {
                                isActive: block.attributes.align === "left",
                                icon: alignLeft,
                                title: 'Left',
                                onClick: () => setAttributes({align: 'left'})
                            },
                            {
                                isActive: block.attributes.align === "center",
                                icon: alignCenter,
                                title: 'Center',
                                onClick: () => setAttributes({align: 'center'})

                            },
                            {
                                isActive: block.attributes.align === "right",
                                icon: alignRight,
                                title: 'Right',
                                onClick: () => setAttributes({align: 'right'})

                            },
                            {
                                isActive: block.attributes.align === "justify",
                                icon: alignJustify,
                                title: 'Justify',
                                onClick: () => setAttributes({align: 'justify'})

                            },
                        ]}
                        icon={getDefaultIcon}
                        label={__('Text align','mailerpress')}
                    />
                </HStack>
            </ToolBar.Fill>
            <Panel>
                {activeTab === 'desktop' &&
                    <PanelBody title="Setting">
                        <PanelRow>
                            <div
                                style={{
                                    flex: 1,
                                    maxWidth: '100%'
                                }}
                            >
                                <TextareaControl
                                    onChange={content => edit({data: {content}})}
                                    value={data.content}
                                />
                            </div>
                        </PanelRow>

                    </PanelBody>
                }
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
                    <PanelRow>
                        <div
                            style={{
                                flex: 1
                            }}
                        >
                            <FontSizePicker
                                withReset={false}
                                withSlider={true}
                                fontSizes={[
                                    {
                                        name: 'Small',
                                        size: '12px',
                                        slug: 'small'
                                    },
                                    {
                                        name: 'Normal',
                                        size: '16px',
                                        slug: 'normal'
                                    },
                                    {
                                        name: 'Big',
                                        size: '26px',
                                        slug: 'big'
                                    }
                                ]}
                                onChange={(val) => edit({'font-size': val})}
                                value={attributes['font-size']}
                            />
                        </div>
                    </PanelRow>
                </PanelBody>
                <PanelBody title="Typographie">
                    <PanelRow>
                        <div
                            style={{
                                flex: 1
                            }}
                        >
                            <LineHeightControl
                                __nextHasNoMarginBottom
                                __unstableInputWidth="100%"
                                value={attributes['line-height']}
                                onChange={val => edit({'line-height': val})}
                            />
                        </div>
                    </PanelRow>

                    <PanelRow>
                        <div
                            style={{
                                flex: 1
                            }}
                        >
                            <SelectControl
                                label={__("Font family", 'mailerpress')}
                                onChange={val => {
                                    setActiveBlockFont(val)
                                    edit({'font-family': val})
                                }}
                                // value={attributes['font-family']}
                                value={getActiveFont}
                                options={fontsAvailable}
                            />
                        </div>
                    </PanelRow>
                    <PanelRow>
                        <div style={{
                            display: 'flex',
                            flex: 1,
                            gap: 8
                        }}>
                            <div style={{flex: 1}}>
                                <SelectControl
                                    label={__("Font style", 'mailerpress')}
                                    onChange={val => edit({'font-style': val})}
                                    value={attributes['font-style']}
                                    options={
                                        [
                                            {
                                                label: 'Normal',
                                                value: 'normal'
                                            },
                                            {
                                                label: 'Italique',
                                                value: 'italic'
                                            },
                                            {
                                                label: 'Oblique',
                                                value: 'oblique'
                                            },
                                        ]}
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <SelectControl
                                    label={"Font weight"}
                                    onChange={val => {
                                        edit({'font-weight': val})
                                    }}
                                    value={attributes['font-weight'] || fontsMapping['text'].selectedVariant}
                                    // value={getFontWeightValue}
                                    options={fontWeights}
                                />
                            </div>
                        </div>
                    </PanelRow>
                    <PanelRow>
                        <div
                            style={{
                                flex: 1
                            }}
                        >
                            <ToggleGroupControl
                                value={attributes.align}
                                __nextHasNoMarginBottom
                                isBlock
                                label="Text align"
                                onChange={val => edit({'align': val})}
                            >
                                <ToggleGroupControlOption
                                    label="Left"
                                    value="left"
                                />
                                <ToggleGroupControlOption
                                    label="Center"
                                    value="center"
                                />
                                <ToggleGroupControlOption
                                    label="Right"
                                    value="right"
                                />
                                <ToggleGroupControlOption
                                    label="Justify"
                                    value="justify"
                                />
                            </ToggleGroupControl>
                        </div>
                    </PanelRow>
                </PanelBody>
                <PanelBody title="Color">
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
    type: blockType.TEXT,
    description: 'Start with the basic building block of all emails.',
    icon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="m9.99609 14v-.2251l.00391.0001v6.225h1.5v-14.5h2.5v14.5h1.5v-14.5h3v-1.5h-8.50391c-2.76142 0-5 2.23858-5 5 0 2.7614 2.23858 5 5 5z"></path></svg>    `,
    edit: props => <BlockPreview
        {...props}
        render={Edit}
    />,
    preview: props => <BlockRenderer
        {...props}
        render={Preview}
    />,
    disabledBlockType: [],
    name: "Text",
    init: (payload) => {
        if (payload.attributes) {
            const mergedPadding = {
                top: payload.paddingTop || "0px",
                right: payload.paddingRight || "0px",
                bottom: payload.paddingBottom || "0px",
                left: payload.paddingLeft || "0px",
            };

            payload.attributes.padding = mergedPadding

            delete payload.attributes.paddingTop;
            delete payload.attributes.paddingBottom;
            delete payload.attributes.paddingLeft;
            delete payload.attributes.paddingRight;
        }

        const defaultData = {
            'type': "text",
            'data': {
                content: "Make it easy for everyone to compose emails"
            },
            attributes: {
                'font-size': '13px',
                'align': 'left',
                'font-style': "normal",
                padding: {
                    top: '10px',
                    right: '10px',
                    bottom: '10px',
                    left: '10px',
                },
                'line-height': "1.5",
            },
            children: [],
        }

        if (window.jsVars.defaultBlocksSettings && window.jsVars.defaultBlocksSettings[blockType.TEXT]) {
            return merge(defaultData, window.jsVars.defaultBlocksSettings[blockType.TEXT], payload)
        }

        return merge(defaultData, payload)
    }
})