import React, {useEffect, useState} from "react"
import HeaderNavigator from "./HeaderNavigator.tsx";
import cx from "classnames/bind";
import {Button, Flex, __experimentalHStack as HStack, __experimentalText as Text} from "@wordpress/components";
import {file} from "@wordpress/icons";
import {t} from "../../../editor/src/utils/function.ts";
import {ca} from "timeago.js/lib/lang";
import {useURL} from "../../context/UrlContext.tsx";

const TemplatesScreen = ({onLoad}) => {
    const {activeView, setActiveView} = useURL();

    const editUrl = category => {
        const url = new URL(window.location.href);  // Get the current URL
        url.searchParams.set("activeView", category);
        setActiveView(category)// Add or modify the activeView query parameter
        window.history.pushState({}, '', url); // Redirect to the updated URL
    }

    useEffect(() => {
        // Function to check URL for activeView parameter
        const checkActiveView = () => {
            const url = new URL(window.location.href);
            const activeViewParam = url.searchParams.get("activeView");
            setActiveView(activeViewParam);
        };

        // Check the activeView on initial load
        checkActiveView();

        onLoad()

        if (activeView === null) {
            setActiveView('')
        }


        // Listen for popstate event (URL change)
        window.addEventListener("popstate", checkActiveView);

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener("popstate", checkActiveView);
            setActiveView(null);
        };
    }, []);

    return (
        <div>
            <HeaderNavigator
                title={"Templates"}
                helpText={"Create new templates, or reset any customizations made to the templates supplied by your theme or plugins."}
            />
            <Flex direction={"column"}>
                <Button
                    className={cx({
                        active: '' === activeView
                    })}
                    aria-pressed={false}
                    style={{
                        color: 'var(--wp-sidebar-link-color, #ffffff)',
                        fontSize: 14

                    }}
                    icon={file}
                    onClick={() => editUrl('')}
                >
                    <HStack className="submenu" style={{paddingLeft: 8}} alignment="center"
                            justify="space-between">
                        <Text>
                            {t('All Templates')}
                        </Text>
                        <Text>1</Text>
                    </HStack>
                </Button>
                {
                    Object.entries(jsVars.templateCategories).map(template => {
                        return (
                            <Button
                                className={cx({
                                    active: template[0] === activeView
                                })}
                                aria-pressed={false}
                                style={{
                                    color: 'var(--wp-sidebar-link-color, #ffffff)',
                                    fontSize: 14

                                }}
                                icon={file}
                                onClick={() => editUrl(template[0])}
                            >
                                <HStack className="submenu" style={{paddingLeft: 8}} alignment="center"
                                        justify="space-between">
                                    <Text>
                                        {template[1].label}
                                    </Text>
                                    <Text>1</Text>
                                </HStack>
                            </Button>
                        )
                    })
                }
            </Flex>
        </div>
    )
}
export default TemplatesScreen