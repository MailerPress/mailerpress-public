import React, {Fragment, useState} from "react"
import {__} from "@wordpress/i18n";
import {
    __experimentalHStack as HStack, __experimentalInputControl as InputControl,
    __experimentalText as Text,
    __experimentalVStack as VStack, Button, Notice, SelectControl
} from "@wordpress/components";
import {check, cloudUpload, create, external, Icon, plugins} from "@wordpress/icons";
import {t} from "../../editor/src/utils/function.ts";
import ComponentWrapper from "./ComponentWrapper.tsx";
import apiFetch from "@wordpress/api-fetch";
import {set} from "react-hook-form";
import ConditionalContent from "../../components/ConditionalContent.tsx";

const SettingView = () => {
    const [AiApiKey, setAiApiKey] = useState(jsVars.gptAi || '')
    const [busy, setBusy] = useState(false)
    const EspManager = () => {
        const esp = jsVars.esp.find(e => e.name === jsVars.pluginInited.provider)

        const disconnectEsp = () => {
            apiFetch({
                path: '/mailerpress/v1/disconnect-provider',
            }).then(() => location.reload());
        }

        return (
            <div className="mailerpress-provider">
                <div className={"mailerpress-provider__area"}>
                    <VStack expanded={false} alignment={"center"}>
                        <img src={esp.image} style={{maxWidth: 300}}/>
                        <HStack expanded={false}>
                            <Icon fill={'#4CAF50'} icon={check}/>
                            <Text variant={"muted"}>Successfully connected</Text>
                        </HStack>
                        <Button onClick={disconnectEsp} variant={"primary"}>{t('Disconnect')}</Button>
                    </VStack>
                </div>
                <div className={"mailerpress-provider__area help"}>
                    <VStack spacing={8}>
                        <div>
                            <Text size={18} weight={"700"}>About {jsVars.pluginInited.provider}</Text>
                            <Text isBlock={true} variant={"muted"}>
                                {esp.description}
                            </Text>
                        </div>
                        <div>
                            <Text size={18} weight={"700"}>Why do I need an email provider?</Text>
                            <Text isBlock={true} variant={"muted"}>
                                Your webhost is not designed to send emails to massive lists. They will eventually end
                                up as
                                spams. Email providers have servers dedicated to sending massive email campaigns to huge
                                lists.
                            </Text>
                        </div>
                    </VStack>
                </div>
            </div>
        )
    }

    const onSave = () => alert()

    return (
        <ComponentWrapper
            desc="Settings to customize your MailerPress experience."
            mainTitle={__('Parameters', 'mailerpress')}
            actions={[
                <Button
                    icon={cloudUpload}
                    onClick={onSave}
                    variant={"primary"}
                >{t('Save settings')}</Button>
            ]}
        >
            <VStack spacing={8}>
                <VStack spacing={1}>
                    <Text weight="700" size={20}>
                        {t('Default sender')}
                    </Text>
                    <Text variant={"muted"}>
                        {t('These email addresses will be selected by default for each new email.')}
                    </Text>
                    <HStack expanded={false} style={{marginTop: 16}} alignment={"left"}>
                        {window.jsVars.senders &&
                            <HStack alignment={"top"} expanded={false} justify={"flex-start"}>
                                <Text style={{width: 150}}>From email</Text>
                                <SelectControl
                                    __next40pxDefaultSize={false}
                                    style={{width: 300}}
                                    options={window.jsVars.senders.reduce((acc, item) => {
                                        acc.push({
                                            label: item,
                                            value: item
                                        })
                                        return acc
                                    }, [])
                                    }
                                />
                            </HStack>
                        }

                        <VStack alignment={"left"} expanded={false} justify={"flex-start"}>
                            <Text style={{width: 150}}>From name</Text>
                            <InputControl style={{width: 300}}
                                          value={jsVars.sender ? JSON.parse(jsVars.sender).fromName : ''}/>
                        </VStack>

                        <VStack alignment={"left"} expanded={false} justify={"flex-start"}>
                            <Text style={{width: 150}}>Reply to</Text>
                            <InputControl style={{width: 300}}
                                          value={jsVars.sender ? JSON.parse(jsVars.sender).fromAddress : ''}/>
                        </VStack>

                        {/*  <HStack>
                        <Button icon={cloudUpload} style={{marginTop: 16}}
                                variant={"primary"}>{t('Update contact informations')}</Button>
                    </HStack>*/}
                    </HStack>
                </VStack>

                <VStack spacing={1}>
                    <Text weight="700" size={20}>
                        {t('Manage Subscription page')}
                    </Text>
                    <Text variant={"muted"}>
                        {t('Allow users who register as a WordPress user on your website to subscribe to a MailerPress list.')}
                    </Text>
                    <ConditionalContent
                        isChecked={true}
                        label={t('Use the default page')}
                        actions={[
                            {label: t('Preview'), url: '#'}
                        ]}
                    >
                        <SelectControl
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            label={t('Page')}
                            options={
                                window.jsVars.pages.reduce((acc, item) => {
                                    acc.push({
                                        label: item.post_title,
                                        value: item.ID
                                    })
                                    return acc
                                }, [])
                            }
                        />
                    </ConditionalContent>
                </VStack>

                <VStack spacing={1}>
                    <Text weight="700" size={20}>
                        {t('Unsubscribe page')}
                    </Text>
                    <Text variant={"muted"}>
                        {t('When your subscribers click the "Unsubscribe" link, they will be directed to a confirmation page. After confirming, the success page will be shown. These pages must contain the [mailerpress_pages] shortcode. Learn more about customizing these pages.')}
                    </Text>
                    <ConditionalContent
                        isChecked={true}
                        label={t('Use the default page')}
                        actions={[
                            {label: t('Preview'), url: '#'}
                        ]}
                    >
                        <SelectControl
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            label={t('Page')}
                            options={
                                window.jsVars.pages.reduce((acc, item) => {
                                    acc.push({
                                        label: item.post_title,
                                        value: item.ID
                                    })
                                    return acc
                                }, [])
                            }
                        />
                    </ConditionalContent>
                </VStack>
            </VStack>
        </ComponentWrapper>
    )
}
export default SettingView