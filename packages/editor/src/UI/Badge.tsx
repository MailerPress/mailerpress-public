import React from "react"
import {classnames} from "../utils/classnames.ts";

type BadeType = {
    type: 'success' | 'error' | 'info' | 'warning',
    label: string
}
const Badge = ({type, label}: BadeType) => {
    return (
        <div className={classnames("mailerpress-badge", `mailerpress-badge-${type}`)}>
            {label}
        </div>
    )
}
export default Badge