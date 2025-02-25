import React, {useEffect} from "react"
import {
    __experimentalVStack as VStack,
    __experimentalHStack as HStack,
    __experimentalText as Text, Button,

} from "@wordpress/components";
import {MenuItem} from "../Sidebar.tsx";
import {chevronLeft, cog, commentAuthorAvatar, layout, envelope} from "@wordpress/icons";
import {t} from "../../../editor/src/utils/function.ts";

const DashboardScreen = ({onLoad}) => {

    useEffect(() => {
        onLoad()
    }, []);

    const items = [
        {
            label: "Campaigns",
            path: "/home/campaigns",
            icon: envelope,
            priority: 1,
        },
        {
            label: "Audience",
            path: "/home/contacts",
            icon: commentAuthorAvatar,
            priority: 2,
        },
        {
            label: "Templates",
            path: "/home/templates",
            icon: layout,
            priority: 3,
        },
        {
            label: "Settings",
            path: "/home/settings",
            icon: cog,
            priority: 4,
        }
    ];

    const menuItems = wp.hooks.applyFilters('mailerpress_menu_items', items);

    return (
        <VStack>
            <HStack expanded={false} justify="flex-start">
                <Button
                    style={{color: 'var(--wp-sidebar-link-color, #ffffff)', outline: "none"}}
                    href={window.jsVars.adminUrl.replace('/admin.php', '')}
                    icon={chevronLeft}
                    variant="link"
                />
                <Text letterSpacing={1.5} weight={"bold"} color="var(--wp-sidebar-link-color, #ffffff)" size={20}>
                    {t('Admin')}
                </Text>
            </HStack>
            <VStack expanded={false} style={{padding: '8px 0 0 0'}}>
                {
                    menuItems.sort((a, b) => a.priority - b.priority).map(screen =>
                        <MenuItem
                            key={screen.path}
                            navigator
                            label={screen.label}
                            path={screen.path}
                            icon={screen.icon}
                        />
                    )
                }
            </VStack>
        </VStack>
    )
}
export default DashboardScreen