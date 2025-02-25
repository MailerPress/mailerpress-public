import React from 'react'
import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption, PanelBody
} from "@wordpress/components";
import {t} from "../../utils/function.ts";
import SettingRow from "../SettingRow.tsx";

export function Panel({children, title, open = true}) {
    return (
        <PanelBody title={title} initialOpen={open}>
            {children}
        </PanelBody>
    )
}