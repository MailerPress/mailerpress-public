import React from "react"
import {__experimentalNumberControl as NumberControl} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import SettingRow from "../SettingRow.tsx";

export const Height = (props) => {
    const {block, setAttributes} = props

    return (
        <SettingRow>
            <NumberControl
                label={__('Height', 'mailerpress')}
                onChange={value => setAttributes({height: `${value}px`})}
                value={block.attributes?.height?.replace('px', '')}
            />
        </SettingRow>
    )
}