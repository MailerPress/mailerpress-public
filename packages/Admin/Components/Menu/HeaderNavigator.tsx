import React from "react"
import {
    __experimentalHStack as HStack,
    __experimentalText as Text,
    __experimentalVStack as VStack,
    __experimentalUseNavigator as useNavigator,
    Icon
} from "@wordpress/components";
import {chevronLeft} from "@wordpress/icons";
import {t} from "../../../editor/src/utils/function.ts";

const HeaderNavigator = ({title, helpText}) => {

    const navigator = useNavigator()

    const ongoBack = () => {
        const url = new URL(window.location.href);
        url.searchParams.delete("activeView");
        window.history.pushState({}, '', url);
        navigator.goBack()
    }

    return (
        <>
            <HStack expanded={false} justify="flex-start">
                <Icon fill={"var(--wp-sidebar-link-color, #ffffff)"} icon={chevronLeft} onClick={ongoBack}/>
                <Text letterSpacing={1.5} weight={"bold"} color="var(--wp-sidebar-link-color, #ffffff)" size={20}>
                    {t(title)}
                </Text>
            </HStack>
            <VStack expand={false}>
                <Text
                    size={13}
                    lineHeight={1.5}
                    style={{
                        margin: "8px 0px 16px 8px",
                    }}
                    color="var(--wp-sidebar-link-color, #ffffff)"
                >
                    {helpText}
                </Text>
            </VStack>
        </>
    )
}
export default HeaderNavigator