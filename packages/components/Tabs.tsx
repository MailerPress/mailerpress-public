import {ReactNode, useEffect, useState} from "react"
import {__experimentalText as Text} from "@wordpress/components";
import {classnames} from "../editor/src/utils/classnames.ts";
import {addQueryParamToUrl} from "../editor/src/utils/function.ts";

type Tab = {
    name: string,
    title: string,
    className: string
    content: ReactNode,
    disabled: boolean
}

interface TabBarProps {
    tabs: Array<Tab>,
    activeTab: number,
    isExpanded?: boolean,
    url?: string,

}

const Tabs = ({tabs, activeTab, isExpanded, url, styles}: TabBarProps) => {

    const [active, setActive] = useState(activeTab)

    useEffect(() => {
        setActive(activeTab)
    }, [activeTab]);


    return (
        <div className={"mailerpress-tab-bar"} style={styles}>
            <div className="tabs">
                {
                    tabs.map((t, index) =>
                        <div
                            onClick={() => (t.disabled === false && active > index) && setActive(index)}
                            key={t.name}
                            className={
                                classnames(
                                    "mailerpress-tab-bar__tab",
                                    t.className,
                                    active === index ? 'active' : '',
                                    isExpanded ? 'expanded' : '',
                                    (t.disabled || active < index) ? 'disabled' : ''
                                )
                            }
                        >
                            <Text weight="700" size={13} upperCase={false}>{t.title}</Text>
                        </div>
                    )
                }
            </div>
            <div className="content">
                {tabs[active].content}
            </div>
        </div>
    )
}
export default Tabs