import React, {PropsWithChildren} from "react"
import SettingRow from "../SettingRow.tsx";
import {__experimentalInputControl as InputControlComponent} from "@wordpress/components";
import {t} from "../../utils/function.ts";

export const InputControl = (props) => {
    const {block, setData, label, value, onChange} = props

    return (
        <SettingRow>
            <InputControlComponent
                label={t(label)}
                value={value ?? block.data['content']}
                onChange={newText => undefined !== onChange ? onChange(newText) : setData({content: newText})}
            />
        </SettingRow>
    )
}