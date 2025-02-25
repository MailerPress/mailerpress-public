import React from 'react'
import {RangeControl as WpRangeControl} from "@wordpress/components";
import {t} from "../../utils/function.ts";

export function RangeControl(props) {
    const {block, label, max, min, onChange, value} = props
    return (
        <WpRangeControl
            label={t(label)}
            max={max}
            min={min}
            onChange={onChange}
            initialPosition={
                value || (parseInt(block.attributes['border-width']?.replace('px', '')) ?? 4)
            }
            value={
                value || (parseInt(block.attributes['border-width']?.replace('px', '')) ?? '')
            }
        />
    )
}