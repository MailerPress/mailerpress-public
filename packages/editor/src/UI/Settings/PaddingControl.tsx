import React from "react"
import SettingRow from "../SettingRow.tsx";
import {__experimentalBoxControl as BoxControl} from "@wordpress/components";
import {t} from "../../utils/function.ts";

export const PaddingControl = (props) => {
    const {block, setAttributes, label, value, onChange} = props

    return (
        <SettingRow>
            <BoxControl
                label={t(label)}
                resetValues={{
                    top: '10px',
                    left: '10px',
                    right: '10px',
                    bottom: '10px',
                }}
                values={{
                    top: value !== undefined ? value['top'] : block.attributes['padding-top'] ?? 0,
                    left: value !== undefined ? value['left'] : block.attributes['padding-left'] ?? 0,
                    right: value !== undefined ? value['right'] : block.attributes['padding-right'] ?? 0,
                    bottom: value !== undefined ? value['bottom'] : block.attributes['padding-bottom'] ?? 0,
                }}
                onChange={(nextValues) => {
                    onChange !== undefined ? onChange(nextValues) :
                        setAttributes(
                            {
                                'padding-top': nextValues.top,
                                'padding-bottom': nextValues.bottom,
                                'padding-right': nextValues.right,
                                'padding-left': nextValues.left,
                            }
                        )
                }}
            />
        </SettingRow>
    )
}