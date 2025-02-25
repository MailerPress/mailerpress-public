import React, {useEffect, useMemo} from "react"
import {
    __experimentalNavigatorProvider as NavigatorProvider,
    __experimentalNavigatorScreen as NavigatorScreen,
    __experimentalNavigatorButton as NavigatorButton,
    __experimentalVStack as VStack,
    __experimentalText as Text,
    __experimentalHStack as HStack, Icon, Flex, Button,
    __experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import {chevronRightSmall, wordpress} from "@wordpress/icons";
import TemplatesScreen from "./Menu/TemplatesScreen.tsx";
import SettingView from "./SettingView.tsx";
import HomeScreen from "./Menu/HomeScreen.tsx";
import ContactsScreen from "./Menu/ContactsScreen.tsx";
import SettingsScreen from "./Menu/SettingsScreen.tsx";
import DashboardView from "./DashboardView.tsx";
import DashboardScreen from "./Menu/DashboardScreen.tsx";
import ListingCampaignsView from "./ListingCampaignsView.tsx";
import {t} from "../../editor/src/utils/function.ts";
import ContactTagsView from "./Screens/ContactTagsView.tsx";
import StatisticsCampaign from "./Screens/StatisticsCampaign.tsx";
import ContactListsView from "./Screens/ContactListsView.tsx";
import ContactView from "./Screens/ContactView.tsx";
import SendingConf from "./Screens/SendingConf.tsx";
import PatternScreen from "./Screens/PatternScreen.tsx";
import TemplateScreen from "./Screens/TemplateScreen.tsx";
import PatternsScreen from "./Menu/PatternsScreen.tsx";
import QueueProcess from "./Screens/QueueProcess.tsx";
import SignUpConfirmation from "./SignUpConfirmation.tsx";
import Upgrade from "./Screens/Upgrade.tsx";

export const MenuItem = ({navigator, label, path, icon, onClick}) => {
    return (
        navigator !== undefined ?
            <NavigatorButton
                iconSize={32}
                icon={icon}
                iconPosition="left"
                style={{
                    color: 'var(--wp-sidebar-link-color, #ffffff)',
                    width: 'initial',
                    height: 'initial'
                }}
                path={path}
            >
                <HStack style={{marginLeft: 8}}>
                    <Text size={14} color={"var(--wp-sidebar-link-color, #ffffff)"}>{label}</Text>
                    <Icon icon={chevronRightSmall}/>
                </HStack>
            </NavigatorButton>
            : <Button variant={"tertiary"} aria-pressed={false} onClick={onClick}
                      style={{color: "var(--wp-sidebar-link-color, #000)"}}>
                {label}
            </Button>

    )
}

const Screens = ({onLoadScreen, activeScreen}) => {
    const navigator = useNavigator()

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set("path", navigator.location.path);
        history.replaceState(null, null, "?" + queryParams.toString());
    }, [navigator.location]);

    const navigationScreens = [
        {
            path: '/home',
            component: DashboardScreen,
            props: {
                onLoad: () => onLoadScreen(<DashboardView/>),
            },
        },
        {
            path: '/home/campaigns',
            component: HomeScreen,
            props: {
                activeScreen,
                onLoad: () => onLoadScreen(<ListingCampaignsView/>, 0),
                onSelectSubscreen: (screen, index) => onLoadScreen(screen, index),
                childs: [
                    {label: t('Your campaigns'), component: <ListingCampaignsView/>},
                    {label: t('Statistics'), component: <StatisticsCampaign/>},
                ],
            },
        },
        {
            path: '/home/contacts',
            component: ContactsScreen,
            props: {
                activeScreen,
                onLoad: () => onLoadScreen(<ContactView/>, 0),
                onSelectSubscreen: (screen, index) => onLoadScreen(screen, index),
                childs: [
                    {label: t('All Contacts'), component: <ContactView/>},
                    {label: t('Contact Lists'), component: <ContactListsView/>},
                    {label: t('Contact Tags'), component: <ContactTagsView/>},
                ],
            },
        },
        {
            path: '/home/templates',
            component: TemplatesScreen,
            props: {
                onLoad: () => onLoadScreen(<TemplateScreen/>),
            },
        },
        {
            path: '/home/patterns',
            component: PatternsScreen,
            props: {
                onLoad: () => onLoadScreen(<PatternScreen/>),
            },
        },
        {
            path: '/home/settings',
            component: SettingsScreen,
            props: {
                activeScreen,
                onLoad: () => onLoadScreen(<SettingView/>, 0),
                onSelectSubscreen: (screen, index) => onLoadScreen(screen, index),
                childs: [
                    {label: t('Parameters'), component: <SettingView/>},
                    {label: t('Sign-up Confirmation'), component: <SignUpConfirmation/>},
                    {label: t('Sending services'), component: <SendingConf/>},
                    {label: t('Queue process'), component: <QueueProcess/>},
                    {label: t('Upgrade'), component: <Upgrade/>},
                ],
            },
        },
    ];

    const activeS = useMemo(() => {
        return activeScreen
    }, [activeScreen])

    const filteredScreens = wp.hooks.applyFilters(
        'mailerpress_admin_navigation',
        navigationScreens,
        activeS,
        onLoadScreen
    );

    return (
        <>
            {
                filteredScreens.map(({path, component: Component, props = {}}) => (
                    <NavigatorScreen key={path} path={path}>
                        <Component {...props} />
                    </NavigatorScreen>
                ))
            }
        </>
    )
}

const Sidebar = ({onLoadScreen, activeScreen}) => {

    const queryParams = new URLSearchParams(window.location.search);

    return (
        <div className="sidebar-content">
            <div className={"sidebar-content__content"}>
                <VStack>
                    <HStack className="sidebar-content__content__logo">
                        <Flex gap={3} expanded={false}>
                            <a href={window.jsVars.adminUrl.replace('/admin.php', '')} style={{
                                color: 'white',
                                outline: 'none',
                                boxShadow: 'none',
                                cursor: 'pointer',
                                display: 'flex'
                            }}>
                                <svg style={{width: 30, pointerEvents: 'none'}} xmlns="http://www.w3.org/2000/svg"
                                     version="1.1"
                                     viewBox="0 0 1058.1 873.9">
                                    <path fill="currentColor" className="st0"
                                          d="M318.3,387.8c0,0-.1,0-.2,0-.6,0-1,.5-1,1h0c1.3,97.6,1.9,195.2,1.9,293,0,32,4.1,53.2,30.9,66.7,5.9,3,16.3,4.4,31.1,4.3,180.3-1,346.3-.9,497.9.4,45.7.4,68.5-22.9,68.5-69.9-.2-53.1-.5-214.8-.8-485.1,0-20.9-1.3-34.2-3.9-39.8-5.7-12.2-13.6-22-23.8-29.1-7-4.9-18.7-7.4-35.1-7.4-238.5,0-476.9.1-715.4,0-22,0-38.1,8-48.2,24-5.9,9.5-8.8,24.4-8.6,44.9,1.1,155.7,2.3,306.3,3.4,451.8,0,2.4-1.7,4.4-4.1,4.8-26.1,4.2-50.4,4.4-72.6-12.2C12.8,616,.1,589.6.1,556.1,0,326.3,0,197.4,0,169.3-.1,109.9,24,63.4,72.5,29.7,108,5,138.2,0,184.8,0c308.2.2,538.6.2,691.1.2,79.2,0,135.8,36,169.7,108,6.7,14.1,10,30.9,10.1,50.4,1.2,272.6,2,454.1,2.5,544.6.3,50.8-19.7,93.6-60.1,128.2-37.5,32.1-71.8,41.9-124.4,42-30.3,0-184.9.3-463.8.5-46.4,0-76.6-2.4-90.6-7.5-51.1-18.2-96.6-67-106.2-122.3-1-5.9-1.6-28.3-1.7-67.1-.8-159.7-.8-310.1,0-451.1,0-3.1,1.6-4.7,4.7-4.7h97.4c4.2,0,8.2,1.8,11,4.9l202.7,224.4c0,0,.1.1.2.2,2.3,2.3,6.1,2.3,8.4,0,0,0,.1-.1.2-.2l200-221.6c4.2-4.6,10.1-7.2,16.2-7.2h85.9c2.4,0,4.4,2,4.4,4.4v415.6c0,1.7-.8,2.6-2.5,2.6h-97.9c-1.6,0-3-1.3-3-3v-247.9c0-5.8-1.9-6.5-5.6-2.1l-197.3,227.6c-.8,1-2,1.5-3.3,1.5s-2.2-.5-3-1.3c-71.8-71-136.2-147.4-207.5-229-1.2-1.3-2.5-2.1-3.9-2.4Z"/>
                                </svg>
                            </a>
                            <svg style={{maxWidth: 80, height: 'auto'}} width="326" height="48" viewBox="0 0 326 48"
                                 fill="var(--wp-sidebar-link-color, #fff)"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0.346 47V2.2H10.074L22.81 31.128L35.354 2.2H45.082V47H36.89V16.792L25.946 41.304H19.482L8.538 16.792V47H0.346ZM61.1705 47.768C59.2932 47.768 57.5438 47.384 55.9225 46.616C54.3012 45.848 52.9785 44.76 51.9545 43.352C50.9732 41.9013 50.4825 40.1947 50.4825 38.232C50.4825 35.8853 51.0585 33.9653 52.2105 32.472C53.3625 30.9787 54.9412 29.8693 56.9465 29.144C58.9945 28.4187 61.2772 28.056 63.7945 28.056H71.3465C71.3465 26.6053 71.1118 25.3893 70.6425 24.408C70.2158 23.4267 69.5545 22.68 68.6585 22.168C67.8052 21.6133 66.7385 21.336 65.4585 21.336C63.9652 21.336 62.6212 21.6773 61.4265 22.36C60.2745 23 59.5705 24.088 59.3145 25.624H51.1225C51.3358 23.32 52.1252 21.336 53.4905 19.672C54.8558 18.008 56.6052 16.728 58.7385 15.832C60.8718 14.936 63.1545 14.488 65.5865 14.488C68.5732 14.488 71.0905 15.0427 73.1385 16.152C75.2292 17.2613 76.8292 18.84 77.9385 20.888C79.0478 22.8933 79.6025 25.2827 79.6025 28.056V37.72C79.6878 38.6587 80.0292 39.2987 80.6265 39.64C81.2238 39.9813 82.0132 40.152 82.9945 40.152V47C80.9892 47 79.3038 46.808 77.9385 46.424C76.6158 46.04 75.5278 45.4853 74.6745 44.76C73.8212 43.992 73.0958 43.032 72.4985 41.88C71.5172 43.544 69.9812 44.952 67.8905 46.104C65.8425 47.2133 63.6025 47.768 61.1705 47.768ZM63.5385 41.176C64.9465 41.176 66.2265 40.856 67.3785 40.216C68.5732 39.576 69.5332 38.68 70.2585 37.528C70.9838 36.376 71.3465 35.0533 71.3465 33.56V33.304H64.3065C63.3678 33.304 62.4718 33.4533 61.6185 33.752C60.7652 34.008 60.0825 34.4347 59.5705 35.032C59.0585 35.5867 58.8025 36.3547 58.8025 37.336C58.8025 38.6587 59.2505 39.64 60.1465 40.28C61.0852 40.8773 62.2158 41.176 63.5385 41.176ZM91.046 11.16C89.5953 11.16 88.3367 10.648 87.27 9.624C86.246 8.55733 85.734 7.29867 85.734 5.848C85.734 4.35467 86.246 3.096 87.27 2.072C88.3367 1.048 89.5953 0.535999 91.046 0.535999C92.5393 0.535999 93.798 1.048 94.822 2.072C95.846 3.096 96.358 4.35467 96.358 5.848C96.358 7.29867 95.846 8.55733 94.822 9.624C93.798 10.648 92.5393 11.16 91.046 11.16ZM86.95 47V15.256H95.142V47H86.95ZM101.13 47V2.2H109.322V47H101.13ZM129.986 47.768C126.658 47.768 123.778 47.0427 121.345 45.592C118.956 44.1413 117.1 42.1573 115.778 39.64C114.455 37.1227 113.794 34.2853 113.794 31.128C113.794 27.7573 114.476 24.8347 115.842 22.36C117.207 19.8853 119.106 17.9653 121.538 16.6C123.97 15.192 126.786 14.488 129.986 14.488C133.143 14.488 135.895 15.1707 138.242 16.536C140.631 17.9013 142.487 19.7787 143.81 22.168C145.175 24.5573 145.858 27.3093 145.858 30.424C145.858 30.9787 145.836 31.5333 145.794 32.088C145.751 32.6 145.687 33.0907 145.602 33.56H122.05C122.178 35.0533 122.562 36.376 123.202 37.528C123.884 38.6373 124.78 39.512 125.89 40.152C127.042 40.7493 128.343 41.048 129.794 41.048C131.287 41.048 132.567 40.728 133.634 40.088C134.743 39.448 135.618 38.4667 136.258 37.144H145.026C144.428 39.0213 143.468 40.7707 142.146 42.392C140.823 44.0133 139.138 45.3147 137.09 46.296C135.084 47.2773 132.716 47.768 129.986 47.768ZM122.114 28.12H137.41C137.367 25.9867 136.578 24.3013 135.042 23.064C133.548 21.8267 131.778 21.208 129.73 21.208C127.98 21.208 126.359 21.7627 124.866 22.872C123.372 23.9387 122.455 25.688 122.114 28.12ZM150.193 47V15.256H158.321V19.992C159.43 18.2 160.838 16.8347 162.545 15.896C164.251 14.9573 166.15 14.488 168.241 14.488V23.064H166.065C163.462 23.064 161.521 23.6827 160.241 24.92C158.961 26.1573 158.321 28.2267 158.321 31.128V47H150.193ZM173.924 47V2.2H188.708C191.865 2.2 194.574 2.66933 196.836 3.608C199.097 4.54667 200.846 5.95466 202.083 7.832C203.321 9.70933 203.94 12.056 203.94 14.872C203.94 17.7733 203.278 20.1627 201.956 22.04C200.676 23.9173 198.884 25.304 196.58 26.2C194.318 27.096 191.694 27.544 188.708 27.544H179.3V47H173.924ZM179.3 23H188.58C192.164 23 194.702 22.3173 196.196 20.952C197.689 19.544 198.436 17.5173 198.436 14.872C198.436 12.184 197.689 10.1573 196.196 8.792C194.702 7.384 192.164 6.68 188.58 6.68H179.3V23ZM210.666 47V15.256H215.53L215.978 21.336C216.959 19.2453 218.453 17.5813 220.458 16.344C222.463 15.1067 224.938 14.488 227.882 14.488V20.12H226.41C222.911 20.12 220.309 21.0587 218.602 22.936C216.895 24.8133 216.042 27.5013 216.042 31V47H210.666ZM247.001 47.768C244.057 47.768 241.39 47.0853 239.001 45.72C236.654 44.3547 234.798 42.4347 233.433 39.96C232.067 37.4427 231.385 34.4987 231.385 31.128C231.385 27.8 232.025 24.8987 233.305 22.424C234.627 19.9067 236.462 17.9653 238.809 16.6C241.198 15.192 243.971 14.488 247.128 14.488C250.115 14.488 252.718 15.1493 254.937 16.472C257.155 17.7947 258.883 19.5867 260.121 21.848C261.401 24.0667 262.041 26.5627 262.041 29.336C262.041 29.9333 262.041 30.4027 262.041 30.744C262.041 31.0853 262.019 31.6187 261.977 32.344H236.697C236.825 34.4347 237.315 36.312 238.169 37.976C239.065 39.5973 240.259 40.8773 241.753 41.816C243.289 42.7547 245.038 43.224 247.001 43.224C249.219 43.224 251.075 42.712 252.569 41.688C254.062 40.664 255.15 39.2773 255.833 37.528H261.145C260.59 39.4907 259.673 41.24 258.393 42.776C257.113 44.312 255.513 45.528 253.593 46.424C251.715 47.32 249.518 47.768 247.001 47.768ZM236.76 28.184H256.729C256.601 25.3253 255.619 23.0853 253.785 21.464C251.95 19.8427 249.689 19.032 247.001 19.032C244.441 19.032 242.158 19.8213 240.153 21.4C238.19 22.936 237.059 25.1973 236.76 28.184ZM281.326 47.768C278.809 47.768 276.547 47.3413 274.542 46.488C272.537 45.592 270.915 44.3547 269.678 42.776C268.483 41.1547 267.737 39.256 267.438 37.08H272.942C273.283 38.744 274.158 40.1947 275.566 41.432C277.017 42.6267 278.958 43.224 281.39 43.224C283.651 43.224 285.315 42.7547 286.382 41.816C287.449 40.8347 287.982 39.6827 287.982 38.36C287.982 37.08 287.662 36.0987 287.022 35.416C286.425 34.7333 285.529 34.2213 284.334 33.88C283.182 33.496 281.753 33.1333 280.046 32.792C278.254 32.408 276.505 31.896 274.798 31.256C273.091 30.5733 271.683 29.656 270.574 28.504C269.465 27.352 268.91 25.8373 268.91 23.96C268.91 22.0827 269.379 20.44 270.318 19.032C271.257 17.624 272.579 16.5147 274.286 15.704C276.035 14.8933 278.083 14.488 280.43 14.488C283.801 14.488 286.553 15.3413 288.686 17.048C290.862 18.712 292.121 21.1013 292.462 24.216H287.15C286.937 22.5947 286.233 21.336 285.038 20.44C283.886 19.5013 282.329 19.032 280.366 19.032C278.446 19.032 276.953 19.4373 275.886 20.248C274.862 21.0587 274.35 22.1253 274.35 23.448C274.35 24.3013 274.649 25.0267 275.246 25.624C275.843 26.2213 276.697 26.7333 277.806 27.16C278.958 27.5867 280.302 27.9707 281.838 28.312C283.971 28.7387 285.913 29.272 287.662 29.912C289.411 30.552 290.819 31.4907 291.886 32.728C292.953 33.9227 293.486 35.6507 293.486 37.912C293.529 39.7893 293.038 41.4747 292.014 42.968C291.033 44.4613 289.625 45.6347 287.79 46.488C285.998 47.3413 283.843 47.768 281.326 47.768ZM313.326 47.768C310.809 47.768 308.547 47.3413 306.542 46.488C304.537 45.592 302.915 44.3547 301.678 42.776C300.483 41.1547 299.737 39.256 299.438 37.08H304.942C305.283 38.744 306.158 40.1947 307.566 41.432C309.017 42.6267 310.958 43.224 313.39 43.224C315.651 43.224 317.315 42.7547 318.382 41.816C319.449 40.8347 319.982 39.6827 319.982 38.36C319.982 37.08 319.662 36.0987 319.022 35.416C318.425 34.7333 317.529 34.2213 316.334 33.88C315.182 33.496 313.753 33.1333 312.046 32.792C310.254 32.408 308.505 31.896 306.798 31.256C305.091 30.5733 303.683 29.656 302.574 28.504C301.465 27.352 300.91 25.8373 300.91 23.96C300.91 22.0827 301.379 20.44 302.318 19.032C303.257 17.624 304.579 16.5147 306.286 15.704C308.035 14.8933 310.083 14.488 312.43 14.488C315.801 14.488 318.553 15.3413 320.686 17.048C322.862 18.712 324.121 21.1013 324.462 24.216H319.15C318.937 22.5947 318.233 21.336 317.038 20.44C315.886 19.5013 314.329 19.032 312.366 19.032C310.446 19.032 308.953 19.4373 307.886 20.248C306.862 21.0587 306.35 22.1253 306.35 23.448C306.35 24.3013 306.649 25.0267 307.246 25.624C307.843 26.2213 308.697 26.7333 309.806 27.16C310.958 27.5867 312.302 27.9707 313.838 28.312C315.971 28.7387 317.913 29.272 319.662 29.912C321.411 30.552 322.819 31.4907 323.886 32.728C324.953 33.9227 325.486 35.6507 325.486 37.912C325.529 39.7893 325.038 41.4747 324.014 42.968C323.033 44.4613 321.625 45.6347 319.79 46.488C317.998 47.3413 315.843 47.768 313.326 47.768Z"
                                    fill="var(--wp-sidebar-link-color, #fff)"/>
                            </svg>
                        </Flex>
                        <Text color={"var(--wp-sidebar-link-color, #fff)"} size={"10px"}>V1.0</Text>
                    </HStack>
                </VStack>
                <VStack className="sidebar-content__content__navigation" style={{marginTop: 16}}>
                    <NavigatorProvider initialPath={queryParams.get('path') ?? '/home'}>
                        <Screens
                            activeScreen={activeScreen}
                            onLoadScreen={onLoadScreen}
                        />
                    </NavigatorProvider>
                </VStack>
            </div>
            <div style={{
                borderTop: '1px solid var(--wp-active-link-background-darken)',
                padding: '10px 8px 18px 8px',
                position: 'sticky',
                bottom: 0,
                background: 'var(--wp-components-color-background-admin)'
            }}>
                <Button
                    icon={wordpress}
                    style={{justifyContent: "center", width: '100%'}}
                    __next40pxDefaultSize={true}
                    variant="primary"
                >{t('Return to admin')}</Button>
            </div>

        </div>
    )
}
export default Sidebar