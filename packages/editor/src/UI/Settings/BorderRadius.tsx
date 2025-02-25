import React from 'react'
import {
    RangeControl
} from "@wordpress/components";
import {t} from "../../utils/function.ts";
import SettingRow from "../SettingRow.tsx";

export function BorderRadius(props) {
    const {block, setAttributes, label} = props

    return (
        <SettingRow>
            <RangeControl
                label={t(label)}
                min={0}
                max={100}
                value={block.attributes['border-radius'] ?? 0}
                onChange={value => setAttributes({'border-radius': `${value}px`})}
            />
        </SettingRow>
    )
}