import React from 'react'
import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption
} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import SettingRow from "../SettingRow.tsx";

export function AlignControl(props) {
    const {block, setAttributes, onChange, value} = props

    return (
        <SettingRow>
            <ToggleGroupControl
                value={value}
                __nextHasNoMarginBottom
                isBlock
                label={__('Alignment', 'mailerpress')}
                onChange={val => onChange !== undefined ? onChange(val) : setAttributes({'align': val})}
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
            </ToggleGroupControl>
        </SettingRow>
    )
}