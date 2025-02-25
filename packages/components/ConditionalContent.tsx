import {
    CheckboxControl,
    __experimentalSpacer as Spacer,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack, Button,
} from "@wordpress/components";
import {PropsWithChildren, useState} from "react";

type type = {
    label: string,
    isChecked: boolean,
    actions?: Array<Record<string, string>>,
}

function ConditionalContent(props: PropsWithChildren<type>) {
    const [checked, setChecked] = useState(props.isChecked);
    return (
        <VStack>
            <Spacer/>
            <HStack>
                <CheckboxControl
                    __nextHasNoMarginBottom
                    checked={checked}
                    label={props.label}
                    onChange={setChecked}
                />
                {props.actions !== undefined && props.actions.map(a =>
                    <Button
                        href={a.url}
                        target={"_blank"}
                        variant={"tertiary"}
                    >
                        {a.label}
                    </Button>)}
            </HStack>
            <Spacer/>
            {!checked ? props.children : null}
        </VStack>
    )
}

export default ConditionalContent