import React, {PropsWithChildren} from "react"
import SettingRow from "../SettingRow.tsx";
import {__experimentalNumberControl as NumberControlWp} from "@wordpress/components";
import {t} from "../../utils/function.ts";

export const NumberControl = (props) => {
    const {label, value, onChange, min, max} = props

    return (
        <SettingRow>
            <NumberControlWp
                min={min}
                max={max}
                label={t(label)}
                value={value ?? ''}
                onChange={onChange}
            />
        </SettingRow>
    )
}