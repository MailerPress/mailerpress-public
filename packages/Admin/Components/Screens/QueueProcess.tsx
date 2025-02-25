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


const QueueProcess = () => {

    return (
        <ComponentWrapper desc="Manage and track the processing of your email queue." mainTitle={"Queue process"}>
        </ComponentWrapper>
    )
}
export default QueueProcess