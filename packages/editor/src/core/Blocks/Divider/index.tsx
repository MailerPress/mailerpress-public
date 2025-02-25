import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType} from "../../../constants.ts";
import {merge} from "lodash";
import {Panel, PanelBody} from "@wordpress/components";
import {
    AlignControl,
    ColorControl,
    PaddingControl, SelectControl, WidthControl, RangeControl
} from "../../../UI/Settings/index.ts";
import React, {useMemo} from "react";
import {useTheme} from "../../../context/Theme.tsx";
import BlockPreview from "../../BlockPreview.tsx";
import BlockRenderer from "../../BlockRenderer.tsx";
import useBlockParams from "../../../hooks/useBlockParams.ts";

const Preview = ({block}) => {
    if (block.attributes.padding) {
        block.attributes['padding-top'] = block.attributes.padding.top;
        block.attributes['padding-right'] = block.attributes.padding.right;
        block.attributes['padding-bottom'] = block.attributes.padding.bottom;
        block.attributes['padding-left'] = block.attributes.padding.left;
    }
    return <BasicBlock params={block} tag="mj-divider">
        {block.data.content}
    </BasicBlock>;
}

const Edit = (props) => {
    const {block, edit} = useBlockParams({...props})
    const {attributes, data} = block
    const {theme} = useTheme()

    const getTheme = useMemo(() => {
        return window.jsVars.themeStyles[theme]
    }, [theme]);

    return (
        <Panel>
            <PanelBody title="Configuration">
                <ColorControl {...props} attrs={['border-color']}/>
                <SelectControl
                    label={"Border style"}
                    options={[
                        {'label': "Solid", value: "solid"},
                        {'label': "Dashed", value: "dashed"},
                        {'label': "Dotted", value: "dotted"},
                    ]}
                    onChange={val => setAttributes({'border-style': val})}
                />
                <RangeControl
                    {...props} label={"Border height"}
                    min={1}
                    max={20}
                    onChange={val => setAttributes({'border-width': `${val}px`})}
                />
            </PanelBody>
            <PanelBody title="Dimensions">
                <PaddingControl
                    {...props}
                    label="Padding"
                    value={attributes.padding}
                    onChange={nextValues => edit({padding: nextValues})}
                />
                <WidthControl
                    onChange={value => setAttributes({width: `${value}%`})}
                    value={block.attributes?.width?.replace('%', '')}
                />
                <AlignControl {...props} />
            </PanelBody>
            <PanelBody title="Style" initialOpen={true}>
                <ColorControl {...props} attrs={['container-background-color']}/>
            </PanelBody>
        </Panel>
    )
}

registerBlockType({
    type: blockType.DIVIDER,
    description: "Create a break between ideas or sections with a horizontal separator.",
    icon: `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M4.5 12.5v4H3V7h1.5v3.987h15V7H21v9.5h-1.5v-4h-15Z"></path></svg>    `,
    edit: props => <BlockPreview
        {...props}
        render={Edit}
    />,
    preview: props => <BlockRenderer
        {...props}
        render={Preview}
    />,
    disabledBlockType: [],
    name: "Divider",
    init: (payload) => {
        const defaultData = {
            'type': blockType.DIVIDER,
            'data': {},
            attributes: {
                width: "100%",
                'border-width': '1px',
                'padding-top': '4px',
                'padding-right': '4px',
                'padding-bottom': '4px',
                'padding-left': '4px',
            },
            children: [],
        }

        if (window.jsVars.defaultBlocksSettings && window.jsVars.defaultBlocksSettings[blockType.DIVIDER]) {
            return merge(defaultData, window.jsVars.defaultBlocksSettings[blockType.DIVIDER], payload)
        }

        return merge(defaultData, payload)
    }
})