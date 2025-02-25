import React, {useEffect, useMemo, useState} from "react"
import ComponentWrapper from "../ComponentWrapper.tsx";
import {
    Flex,
    __experimentalSpacer as Spacer,
    __experimentalText as Text,
    __experimentalGrid as Grid,
    __experimentalVStack as VStack,
    __experimentalHeading as Heading, Button,
} from "@wordpress/components";
import {t} from "../../../editor/src/utils/function.ts";
import cx from "classnames/bind";


const Upgrade = () => {

    return (
        <ComponentWrapper
            desc={t('Take your email marketing strategy to the next level')}
            mainTitle={t("Upgrade plugin")}
        >
        </ComponentWrapper>
    )
}
export default Upgrade
