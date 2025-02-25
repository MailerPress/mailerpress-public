import React, {FC, PropsWithChildren} from 'react'
import {classnames} from "../editor/src/utils/classnames.ts";
import {
    __experimentalText as Text,
    __experimentalHStack as HStack,
    Icon
} from "@wordpress/components";
import {closeSmall} from '@wordpress/icons';

type TagType = {
    type?: "success" | "error" | "warning" | "info",
    withPoint?: boolean,
    isDeletable?: boolean,
    onDelete?: Function,
    icon?: FC
}
export default function Tag(props: PropsWithChildren<TagType>) {
    return (
        <div className={classnames(
            'mailerpress-tag',
            `mailerpress-tag__${props.type ?? 'default'}`
        )}>
            {props.withPoint !== undefined && true === props.withPoint && props.icon === undefined && <span className="point"/>}
            {props.icon !== undefined && <Icon icon={props.icon}/>}
            <Text weight={"light"}>
                <HStack spacing={1} alignment={"center"} justify={"center"}>
                    <Text>{props.children}</Text>
                    {props.isDeletable && <div style={{display: 'flex', cursor: 'pointer'}} onClick={props.onDelete}>
                        <Icon style={{pointerEvents: 'none'}} icon={closeSmall}/>
                    </div>}
                </HStack>
            </Text>
        </div>
    )
}