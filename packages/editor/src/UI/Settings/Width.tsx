import React from "react"
import {__experimentalNumberControl as NumberControl, PanelRow} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import SettingRow from "../SettingRow.tsx";

export const Width = ({onChange, value, min, max}) => {

    return (
        <SettingRow>
            {min !== undefined && max !== undefined ?
                <NumberControl
                    min={min}
                    max={max}
                    label={__('Width','mailerpress')}
                    onChange={onChange}
                    value={value}
                />
                :
                <NumberControl
                    label={__('Width','mailerpress')}
                    onChange={onChange}
                    value={value}
                />
            }
        </SettingRow>
    )
}