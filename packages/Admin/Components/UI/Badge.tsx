import React from "react"
import {__experimentalText as Text, __experimentalHStack as HStack} from "@wordpress/components";
import {t} from "../../../editor/src/utils/function.ts";

const Badge = ({label, type}) => {
    const getBackground = () => {
        switch (type) {
            case 'success':
                return 'hsl(162.3, 86.6%, 32.2%)'
            case 'info':
                return '#007cba'
            case 'error':
                return '#F44336'
            case 'pending':
                return '#FF9800'
            default:
                return 'hsl(0, 1%, 80.6%)'
        }
    }
    return (
        <HStack expanded={false} alignment={"left"}>
            <div style={{
                display: 'block',
                height: 8,
                width: 8,
                borderRadius: '4px',
                background: getBackground()
            }}></div>
            <Text upperCase={true} size={12} weight={"bold"}>
                {t(label)}
            </Text>
        </HStack>
    )
}
export default Badge