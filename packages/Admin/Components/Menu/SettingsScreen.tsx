import React, {useEffect} from "react"
import HeaderNavigator from "./HeaderNavigator.tsx";
import {
    __experimentalNavigatorButton as NavigatorButton,
    __experimentalNavigatorScreen as NavigatorScreen, Button,
    Flex
} from "@wordpress/components";
import {MenuItem} from "../Sidebar.tsx";
import SettingView from "../SettingView.tsx";
import cx from "classnames/bind";
import {useURL} from "../../context/UrlContext.tsx";

const SettingsScreen = ({onLoad, childs, onSelectSubscreen, activeScreen}) => {
    const {activeView, setActiveView} = useURL();

    useEffect(() => {

        if (activeView === null) {
            const activeChild = childs[0]
            setActiveView(activeChild ? activeChild.label : childs[0].label)
        }

        return () => {
            setActiveView(null)
        }
    }, []);

    useEffect(() => {
        if (activeView !== null) {
            const activeChild = childs.find(child => child.label === activeView)
            onSelectSubscreen(activeChild.component, childs.findIndex(child => child.label === activeView))
        }

    }, [activeView]);

    const editUrl = (child, index) => {
        const url = new URL(window.location.href);  // Get the current URL
        url.searchParams.set("activeView", child.label);
        onSelectSubscreen(child.component, index)
        setActiveView(child.label)// Add or modify the activeView query parameter
        window.history.pushState({}, '', url); // Redirect to the updated URL
    }

    return (
        <div>
            <HeaderNavigator
                title={"Settings"}
                helpText={"Pimp your MailerPress experience."}
            />
            {
                childs && <div style={{padding: '8px 0px 0px 0px'}}>
                    <Flex direction={"column"}>
                        {childs.map((child, index) =>
                            <Button
                                className={cx({
                                    active: child.label === activeView
                                })}
                                aria-pressed={false}
                                style={{
                                    color: 'var(--wp-sidebar-link-color, #ffffff)',
                                    fontSize: 14
                                }}
                                onClick={() => editUrl(child, index)}

                                // onClick={() => onSelectSubscreen(child.component, index)}
                            >
                                {child.label}
                            </Button>
                        )}
                    </Flex>
                </div>
            }
        </div>
    )
}
export default SettingsScreen