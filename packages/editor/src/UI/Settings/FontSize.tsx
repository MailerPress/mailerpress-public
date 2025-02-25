import React from 'react'
import {FontSizePicker} from "@wordpress/components";

export function FontSize(props) {
    const {block, setAttributes, onChange, value} = props
    return (
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
            onChange={(val) => onChange ? onChange(val) : setAttributes({'font-size': val})}
            value={value || block.attributes['font-size']}
        />
    )
}