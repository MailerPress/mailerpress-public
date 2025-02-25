import {
    __experimentalText as Text,
    __experimentalVStack as VStack,
    __experimentalHStack as HStack,
    __experimentalInputControl as InputControl,
    Button, Notice, SelectControl
} from "@wordpress/components";
import {check, cog, Icon, plugins, external, cloudUpload} from "@wordpress/icons";
import Tabs from "./Tabs.tsx";
import ListingCampaigns from "./ListingCampaigns.tsx";
import {__} from "@wordpress/i18n";
import {t} from "../editor/src/utils/function.ts";
import {} from "@wordpress/components/build-types/h-stack";
import apiFetch from "@wordpress/api-fetch";
import {Fragment, useState} from "react";

const ComponentWrapper = ({mainTitle, children}) => {
    return (
        <div className="component-view">
            <div className="container">
                <Text size={26} upperCase={true} letterSpacing={1.8} weight="700">{mainTitle}</Text>
                {children}
            </div>
        </div>
    )
}

const Header = () => {
    const searchParams = new URLSearchParams(window.location.search);


    return (
        <div className="mailerpress-app__header">
            <div className="mailerpress-app__header__first">
                <div>
                    <Text weight="bold">MailerPress</Text>
                </div>
                <div style={{display: "flex", alignItems: 'center', gap: 8}}>
                    <Button icon={cog}/>
                </div>
            </div>
            <Tabs
                url={`${jsVars.adminUrl}?page=mailerpress/campaigns.php`}
                activeTab={parseInt(searchParams.get('activeTab')) || 0}
                isExpanded={false}
                tabs={[
                    {
                        disabled: false,
                        name: 'campaigns',
                        title: 'Campaigns',
                        className: '',
                        content: <ListingCampaigns/>
                    },
                    {
                        disabled: true,
                        name: 'contact',
                        title: 'Contact',
                        className: '',
                        content: <ComponentWrapper mainTitle={__('Lists')}>
                            <VStack>
                                <Text variant={"muted"}>Manage your contact list.</Text>
                            </VStack>
                        </ComponentWrapper>
                    },
                    {
                        disabled: true,
                        name: 'optin',
                        title: 'Formulaire opt-in',
                        className: '',
                        content: <ComponentWrapper mainTitle={__('Opt-in')}>
                            <VStack>
                                <Text variant={"muted"}>Create beautiful opt-in form.</Text>
                            </VStack>
                        </ComponentWrapper>
                    },
                    // {
                    //     name: 'automation',
                    //     title: 'Automation',
                    //     className: '',
                    //     content: <ComponentWrapper mainTitle={__('Automation')}></ComponentWrapper>
                    // },
                    {
                        disabled: false,
                        name: 'settings',
                        title: 'Settings',
                        className: '',
                        content: <ComponentWrapper mainTitle={__('Settings')}>
                            <VStack>
                                <Text variant={"muted"}>Setup your MailerPress experience.</Text>
                            </VStack>

                            <VStack>
                                <HStack>
                                    <Text weight="700" size={20} style={{marginBottom: 16}}>
                                        Licence
                                    </Text>
                                    <Button icon={plugins} variant={"tertiary"}>
                                        Go premium
                                    </Button>
                                </HStack>
                                <Notice
                                    className={"licence-notice"}
                                    isDismissible={false}
                                    politeness="assertive"
                                >
                                    <Fragment key=".0">
                                        <HStack>
                                            <Text>
                                                {t('You are currently using the free version of mailerpress\n')}
                                            </Text>
                                            <Button icon={external} variant={"primary"}>
                                                See benefits of premium plan
                                            </Button>
                                        </HStack>
                                    </Fragment>
                                </Notice>
                            </VStack>

                            <VStack style={{marginTop: 30}}>
                                <Text weight="700" size={20} style={{marginBottom: 16}}>
                                    Contact informations
                                </Text>
                                <VStack expanded={false}>
                                    <HStack alignment={"top"} expanded={false} justify={"flex-start"}>
                                        <Text style={{width: 150}}>From email</Text>
                                        <SelectControl
                                            __next40pxDefaultSize={false}
                                            style={{width: 300}}
                                            options={jsVars.senders.reduce((acc, item) => {
                                                acc.push({
                                                    label: item,
                                                    value: item
                                                })
                                                return acc
                                            }, [])
                                            }
                                        />
                                    < /HStack>

                                    <HStack alignment={"top"} expanded={false} justify={"flex-start"}>
                                        <Text style={{width: 150}}>From name</Text>
                                        <InputControl style={{width: 300}} value={jsVars.pluginInited.from_name}/>
                                    </HStack>

                                    <HStack alignment={"top"} expanded={false} justify={"flex-start"}>
                                        <Text style={{width: 150}}>Reply to</Text>
                                        <InputControl style={{width: 300}} value={jsVars.pluginInited.reply_to}/>
                                    </HStack>

                                    <HStack>
                                        <Button icon={cloudUpload} style={{marginTop: 16}}
                                                variant={"primary"}>{t('Update contact informations')}</Button>
                                    </HStack>
                                </VStack>
                            </VStack>

                            <VStack style={{marginTop: 30}}>
                                <Text weight="700" size={20} style={{marginBottom: 16}}>
                                    Email provider
                                </Text>
                                <EspManager/>
                            </VStack>

                            <VStack style={{marginTop: 30}}>
                                <VStack>
                                    <Text weight="700" size={20} style={{marginBottom: 16}}>
                                        ChatGPT API KEY
                                    </Text>
                                </VStack>
                                <VStack expanded={false}>
                                    <VStack alignment={"top"} expanded={false} align={"flex-start"}>
                                        <InputControl
                                            value={AiApiKey}
                                            type={"password"}
                                            placeholder={"API KEY..."}
                                            style={{width: 460}}
                                            onChange={setAiApiKey}
                                        />
                                        <Button target={"_blank"} icon={external}
                                                href="https://platform.openai.com/api-keys" variant={"secondary"}>
                                            {t('Get my API KEY')}
                                        </Button>
                                    </VStack>
                                </VStack>
                            </VStack>
                        </ComponentWrapper>
                    },
                ]}
            />
        </div>
    )
}
export default Header