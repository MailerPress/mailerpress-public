import React from "react"
import {__experimentalNumberControl as NumberControl, PanelRow} from "@wordpress/components";
import {__} from "@wordpress/i18n";

export const WidthHeight = (props) => {
    const {block, setAttributes, label} = props

    return (
        <PanelRow>
            <div style={{flex: 1, marginRight: 8}}>
                <NumberControl
                    label={__('Width', 'mailerpress')}
                    onChange={value => setAttributes({width: `${value}px`})}
                    value={block.attributes?.width?.replace('px', '')}
                />
            </div>
            <div style={{flex: 1}}>
                <NumberControl
                    label={__('Height', 'mailerpress')}
                    onChange={value => setAttributes({height: `${value}px`})}
                    value={block.attributes?.height?.replace('px', '')}
                />
            </div>
        </PanelRow>

    )
}