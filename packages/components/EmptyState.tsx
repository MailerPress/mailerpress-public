import React, {FC, ReactNode} from "react"
import {
    __experimentalHeading as Heading,
    __experimentalHStack as HStack,
    __experimentalText as Text, Button
} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import {plus} from "@wordpress/icons"

type emptyStateProps = {
    label: string,
    description: string,
    children?: ReactNode,
    resetAll: Function,
    createLink: string
}
const EmptyState = (
    {label, description, resetAll, createLink}: emptyStateProps
) => {
    return (
        <div className={"empty-state-component"}>
            <img style={{maxWidth: 300, borderRadius: "50%", marginBottom: 8}}
                 src="https://img.freepik.com/premium-vector/search-found-no-data-found-data-empty_1249780-8.jpg?w=1060"
                 alt=""/>
            <Heading>
                {label}
            </Heading>
            <Text variant={"muted"}>
                {description}
            </Text>
            <HStack justify={"center"}>
                {createLink !== undefined &&
                    <Button icon={plus} href={createLink} style={{marginTop: 8}} variant={"primary"} onClick={resetAll}>
                        {__('Add', 'mailerpress')}
                    </Button>
                }
                <Button style={{marginTop: 8}} variant={"tertiary"} onClick={resetAll}>
                    {__('Reset all filters', 'mailerpress')}
                </Button>
            </HStack>

        </div>

    )
}
export default EmptyState