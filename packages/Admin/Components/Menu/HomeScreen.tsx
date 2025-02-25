import React, {useEffect} from "react"
import HeaderNavigator from "./HeaderNavigator.tsx";
import ContactView from "../ContactView.tsx";
import ContactTagsView from "../ContactTagsView.tsx";
import {Button, Flex} from "@wordpress/components";
import {MenuItem} from "../Sidebar.tsx";
import cx from "classnames/bind";

const HomeScreen = ({onLoad, onSelectSubscreen, childs, activeScreen}) => {

    useEffect(() => {
        onLoad()
    }, []);

    return (
        <div>
            <HeaderNavigator
                title={"Campaigns"}
                helpText={"Here you will find all your email campaigns."}
            />
            {
                childs && <div style={{padding: '8px 0px 0px 0px'}}><Flex direction={"column"}>
                    {childs.map((child, index) =>
                        <Button
                            className={cx({
                                active: activeScreen === index
                            })}
                            aria-pressed={false}
                            style={{
                                color: 'var(--wp-sidebar-link-color, #ffffff)',
                                fontSize: 14
                            }}
                            onClick={() => onSelectSubscreen(child.component, index)}
                        >
                            {child.label}
                        </Button>
                    )}
                </Flex></div>

            }
        </div>
    )
}
export default HomeScreen