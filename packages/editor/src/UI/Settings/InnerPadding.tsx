import React, {useEffect, useState} from 'react'
import SettingRow from "../SettingRow.tsx";
import {__experimentalBoxControl as BoxControl} from "@wordpress/components";
import {__} from "@wordpress/i18n";

interface BoxControlValues {
    top: number,
    left: number,
    right: number,
    bottom: number,
}

export function InnerPadding(props) {
    const {block, setAttributes} = props
    const [values, setValues] = useState()

    useEffect(() => {
        const splited = block.attributes['inner-padding'] ? block.attributes['inner-padding'].split(' ') : "10px 25px 10px 25px".split(' ')
        setValues({
            top: splited[0],
            right: splited[1],
            bottom: splited[2],
            left: splited[3],
        })
    }, [block.attributes]);

    return (
        <SettingRow>
            <BoxControl
                label={__('Inner padding','mailerpress')}
                resetValues={{
                    top: '10px',
                    left: '10px',
                    right: '10px',
                    bottom: '10px',
                }}
                values={values}
                onChange={(nextValues) => {
                    setAttributes(
                        {
                            'inner-padding': `${typeof nextValues.top === 'string' ? nextValues.top : `${nextValues.top}px`} ${typeof nextValues.right === 'string' ? nextValues.right : `${nextValues.right}px`} ${typeof nextValues.bottom === 'string' ? nextValues.bottom : `${nextValues.bottom}px`} ${typeof nextValues.left === 'string' ? nextValues.left : `${nextValues.left}px`}`,
                        }
                    )
                }}
            />
        </SettingRow>
    )
}