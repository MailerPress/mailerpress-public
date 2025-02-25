import React, {FC, ReactNode, useEffect, useState} from "react"
import {classnames} from "../utils/classnames.ts";
import {__experimentalText as Text} from "@wordpress/components";
import {useDispatch, useSelect} from "@wordpress/data";
import {STORE_KEY} from "../constants.ts";

type Tab = {
    name: string,
    title: string,
    className: string
    content: ReactNode
}

interface TabBarProps {
    tabs: Array<Tab>,
    activeTab: number,
    isExpanded?: boolean
    indexState: string,
}

const TabBar = ({tabs, activeTab, isExpanded, indexState}: TabBarProps) => {
    const {setTabs, selectBlock} = useDispatch(STORE_KEY)
    const {tabsState} = useSelect(select => {
        return {
            tabsState: select(STORE_KEY).getTabs(),
        }
    }, [])

    useEffect(() => {
        if (tabsState.settings === 0) {
            selectBlock(null)
        }
    }, [tabsState]);

    const setActive = (index) => {
        setTabs({
            ...tabsState,
            [indexState]: index
        })
    }

    return (
        <div className={"mailerpress-tab-bar"}>
            <div className="tabs">
                {
                    tabs.map((t, index) =>
                        <div
                            onClick={() => setActive(index)}
                            key={t.name}
                            className={
                                classnames(
                                    "mailerpress-tab-bar__tab",
                                    t.className,
                                    tabsState[indexState] === index ? 'active' : '',
                                    isExpanded ? 'expanded' : ''
                                )
                            }
                        >
                            <Text weight="500">{t.title}</Text>
                        </div>
                    )
                }
            </div>
            <div className="content">
                {tabs[tabsState[indexState]].content}
            </div>
        </div>
    )
}
export default TabBar