import React from "react"
import {PanelRow} from "@wordpress/components";

const SettingRow = ({children}) => {
    return (
        <PanelRow>
            <div style={{flex: 1, width: "100%"}}>
                {children}
            </div>
        </PanelRow>
    )
}
export default SettingRow