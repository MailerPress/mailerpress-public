import React from "react"
import ComponentWrapper from "../ComponentWrapper.tsx";
import {Button} from "@wordpress/components";
import {create} from "@wordpress/icons";
import {t} from "../../../editor/src/utils/function.ts";

const PatternScreen = () => {
    return (
        <ComponentWrapper desc="Reusable structures for your email design." mainTitle={"Patterns"} actions={[
            <Button
                icon={create}
                variant={"primary"}
            >{t('Create pattern')}</Button>
        ]}>

        </ComponentWrapper>
    )
}
export default PatternScreen