import React, {useEffect, useMemo, useState} from "react"
import ComponentWrapper from "../ComponentWrapper.tsx";
import {
    Flex,
    __experimentalSpacer as Spacer,
    __experimentalText as Text,
    __experimentalGrid as Grid,
    __experimentalVStack as VStack,
    __experimentalHStack as HStack,
    __experimentalInputControl as InputControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalHeading as Heading, Button, ToggleControl, Notice, CheckboxControl, DropdownMenu, MenuGroup, MenuItem,
} from "@wordpress/components";
import {t} from "../../../editor/src/utils/function.ts";
import {check, Icon, moreVertical, send, settings, warning} from "@wordpress/icons";
import {useModalContext} from "../../context/ModalContext.tsx";
import cx from "classnames/bind";
import apiFetch from "@wordpress/api-fetch";
import {useToasts} from "../../../editor/src/hooks/useToasts.ts";
import Tag from "../../../components/Tag.tsx";
import {useNoticeWarning} from "../../context/NoticeWarningEsp.tsx";


const EspConfig = ({service, OnRenderConfig}) => {

    const ContentRenderer = props => {
        if (props.preview) {
            return <props.render block={{...props}}/>
        }

        const content = wp.hooks.applyFilters('mailerpress-render-esp-config', <OnRenderConfig/>);
        return content;
    }

    return (
        <VStack spacing={3}>
            <Text>
                {service.description}
            </Text>
            <ContentRenderer/>
        </VStack>
    )
}

const PhpConfig = ({onSave, activated}) => {

    const [data, setData] = useState({
        default_name: activated.services && activated.services.php && activated.services.php.conf.default_name || '',
        default_email: activated.services && activated.services.php && activated.services.php.conf.default_email || '',
    })

    return (
        <>
            <Notice status={"warning"} isDismissible={false}>
                {t('When using PHP Mail, emails may not be delivered reliably. For optimal performance, we recommend using a dedicated email provider.')}
            </Notice>

            <InputControl
                value={data.default_email}
                onChange={value => setData({...data, default_email: value})}
                __next40pxDefaultSize
                label={t('Default shipping email')}
            />

            <InputControl
                value={data.default_name}
                onChange={value => setData({...data, default_name: value})}
                __next40pxDefaultSize
                label={t('Default shipping name')}
            />

            <HStack justify='flex-end'>
                <Button
                    disabled={data.default_email === '' || data.default_name === ''}
                    variant="primary"
                    onClick={() => onSave(data)}
                >
                    {t('Save changes')}
                </Button>
            </HStack>
        </>
    )
}

const SendGridConfig = () => {
    return (
        <>
            <InputControl
                __next40pxDefaultSize
                label={t('SendGrid API key')}
                help={t('To obtain a SendGrid API key, you must generate an API key. To send emails, the API key only requires “Mail Send” access.')}
            />
            <InputControl
                __next40pxDefaultSize
                label={t('Default shipping email')}
            />

            <InputControl
                __next40pxDefaultSize
                label={t('Default shipping name')}
            />
        </>
    )
}

const BrevoConfig = ({onSave, activated}) => {

    const [data, setData] = useState({
        api_key: activated.services && activated.services.brevo && activated.services.brevo.conf.api_key || '',
        default_name: activated.services && activated.services.brevo && activated.services.brevo.conf.default_name || '',
        default_email: activated.services && activated.services.brevo && activated.services.brevo.conf.default_email || '',
    })

    return (
        <>
            <InputControl
                type={'password'}
                value={data.api_key}
                onChange={value => setData({...data, api_key: value})}
                __next40pxDefaultSize
                label={t('Brevo API key')}
                help={t('To obtain a SendGrid API key, you must generate an API key. To send emails, the API key only requires “Mail Send” access.')}
            />
            <InputControl
                value={data.default_email}
                onChange={value => setData({...data, default_email: value})}
                __next40pxDefaultSize
                label={t('Default shipping email')}
            />

            <InputControl
                value={data.default_name}
                onChange={value => setData({...data, default_name: value})}
                __next40pxDefaultSize
                label={t('Default shipping name')}
            />

            <HStack justify='flex-end'>
                <Button
                    disabled={data.default_email === '' || data.default_name === '' || data.api_key === ''}
                    variant="primary"
                    onClick={() => onSave(data)}
                >
                    {t('Save changes')}
                </Button>
            </HStack>
        </>
    )
}

const MailerPressConfig = ({onSave, activated}) => {

    const [data, setData] = useState({
        api_key: activated.services && activated.services.mailerpress && activated.services.mailerpress.conf.api_key || '',
        default_name: activated.services && activated.services.mailerpress && activated.services.mailerpress.conf.default_name || '',
        default_email: activated.services && activated.services.mailerpress && activated.services.mailerpress.conf.default_email || '',
    })

    return (
        <>
            <InputControl
                type={'password'}
                value={data.api_key}
                onChange={value => setData({...data, api_key: value})}
                __next40pxDefaultSize
                label={t('MailerPress API key')}
            />
            <InputControl
                value={data.default_email}
                onChange={value => setData({...data, default_email: value})}
                __next40pxDefaultSize
                label={t('Default shipping email')}
            />

            <InputControl
                value={data.default_name}
                onChange={value => setData({...data, default_name: value})}
                __next40pxDefaultSize
                label={t('Default shipping name')}
            />

            <HStack justify='flex-end'>
                <Button
                    disabled={data.default_email === '' || data.default_name === '' || data.api_key === ''}
                    variant="primary"
                    onClick={() => onSave(data)}
                >
                    {t('Save changes')}
                </Button>
            </HStack>
        </>
    )
}

const SmtpConfig = () => {

    const [data, setData] = useState({
        host: '',
        port: '',
        encryption: 'tls',
        default_name: '',
        default_email: '',
        auth_password: '',
        auth_id: '',
        auto_tls: false,
        auth: false
    })

    return (
        <>
            <InputControl
                __next40pxDefaultSize
                label={t('SMTP Host Name')}
                help={t('The URL (e.g. smtp.mailprovider.com) or IP address of your SMTP host.')}
            />
            <InputControl
                __next40pxDefaultSize
                label={t('SMTP port')}
                help={t('Port 465 is typically used with SSL. Ports 25 and 587 are typically used with TLS.')}
            />


            <ToggleControl
                __nextHasNoMarginBottom
                label={t('Auto TLS')}
                help={t('SMTP servers generally use the TLS protocol if it is available. However, on some servers you may need to disable it to avoid problems.')}
                onChange={value => setData({...data, auto_tls: value})}
                checked={data.auto_tls}
            />


            <ToggleGroupControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                isBlock
                style={{width: '100%'}}
                label={t('Encryption')}
                value={data.encryption}
                onChange={value => setData({...data, encryption: value})}
                help={t('In most cases, TLS is the preferred encryption method.')}
            >
                <ToggleGroupControlOption
                    label={t('TLS')}
                    value="tls"
                />
                <ToggleGroupControlOption
                    label={t('SSL')}
                    value="ssl"
                />
                <ToggleGroupControlOption
                    label={t('None')}
                    value="none"
                />
            </ToggleGroupControl>

            <ToggleControl
                __nextHasNoMarginBottom
                label={t('Authentication')}
                help={t('Enable authentication if your SMTP server requires a username and password. This option should be enabled in most cases.')}
                onChange={value => setData({...data, auth: value})}
                checked={data.auth}
            />

            {data.auth && (
                <>
                    <InputControl
                        __next40pxDefaultSize
                        label={t('Authentication ID')}
                        help={t('The identifier used to connect to your email server.')}
                        value={data.auth_id}
                        onChange={value => setData({...data, auth_id: value})}
                    />

                    <InputControl
                        type={'password'}
                        __next40pxDefaultSize
                        label={t('Authentication password')}
                        help={t('The password to access your email server. It will be stored securely in the database.')}
                        value={data.auth_password}
                        onChange={value => setData({...data, auth_password: value})}
                    />
                </>
            )}

            <InputControl
                __next40pxDefaultSize
                label={t('Default shipping email')}
                value={data.default_email}
                onChange={value => setData({...data, default_email: value})}
            />

            <InputControl
                __next40pxDefaultSize
                label={t('Default shipping name')}
                value={data.default_name}
                onChange={value => setData({...data, default_name: value})}
            />

        </>
    )
}

const SendingConf = () => {
    const {setData, data} = useNoticeWarning()
    const {setModal} = useModalContext()
    const {pushToast} = useToasts();

    const [activated, setActivated] = useState(data)

    const handleConfigModal = ((service, onRenderConfig) => {
        setModal({
            title: `${service.name} - ${t('settings')}`,
            size: 'medium',
            component: <EspConfig
                service={service}
                OnRenderConfig={onRenderConfig}
            />
        })
    })

    const SenderProvider = ({service, onClick, selected, connected, onRenderConfig}) => {

        const handleSendTest = async (data) => {
            const result = await apiFetch({
                path: '/mailerpress/v1/send-email',
                method: 'POST',
                data: {
                    to: data.to,
                    html: data.html,
                    key: service.key
                }
            })

            if (result === false) {
                pushToast({
                    title: t("An error occurred while sending the test email."),
                    type: 'error',
                    duration: 5
                })
            } else {
                pushToast({
                    title: t('The test email has been sent successfully.'),
                    type: 'success',
                    duration: 5
                })
            }

            setModal(null)
        }

        const SendModalTester = () => {

            const [data, setData] = useState({
                to: '',
                html: true
            })

            return (
                <VStack spacing={3}>
                    <InputControl
                        value={data.to}
                        onChange={value => setData({...data, to: value})}
                        __next40pxDefaultSize
                        label={t('Send to')}
                        help={t('Enter the email address to which you want to send the test email.')}
                    />

                    <ToggleControl
                        label={t('HTML')}
                        help={t('Send the test email in HTML format.\n')}
                        onChange={value => setData({...data, html: value})}
                        checked={data.html}
                    />

                    <HStack justify='flex-end'>
                        <Button variant="secondary">
                            {t('Cancel')}
                        </Button>
                        <Button
                            icon={send}
                            disabled={data.to === ''}
                            variant="primary"
                            onClick={() => handleSendTest(data)}
                        >
                            {t('Send')}
                        </Button>
                    </HStack>
                </VStack>
            )
        }

        const toggleEmailService = async (value) => {
            let result = null

            if (false === value) {
                result = await apiFetch({
                    path: '/mailerpress/v1/connect-provider',
                    method: 'POST',
                    data: {
                        key: service.key,
                        activated: false,
                        config: {
                            conf: null
                        }
                    }
                })
            } else {
                result = await apiFetch({
                    path: '/mailerpress/v1/connect-provider',
                    method: 'POST',
                    data: {
                        key: service.key,
                        activated: true,
                        config: {
                            conf: null
                        }
                    }
                })
            }

            if (null !== result) {
                setData(result)
                setActivated(result)
            }
        }

        const handleSetPrimary = async () => {

            const result = await apiFetch({
                path: '/mailerpress/v1/set-primary-email-service',
                method: 'POST',
                data: {
                    key: service.key,
                }
            })

            setModal(null)
            setActivated(result)

            pushToast({
                title: `${service.name} ${t('has been set as the primary email service')}`,
                type: 'success',
                duration: 5
            })
        }

        const handleSetTest = () => {
            setModal({
                title: `${t('Send a test email with')} ${service.name}`,
                size: 'medium',
                component: <SendModalTester/>
            })
        }

        return (
            <div className={cx({
                "mailerpress-card mailerpress-card--integration": true,
                "mailerpress-card mailerpress-card--error": connected && activated.default_service === service.key && activated.activated && !Object.values(activated.activated).includes(service.key),
            })}>
                <div className="mailerpress-card__top-container header">
                    <div className="header__container">
                        <div className="icon" dangerouslySetInnerHTML={{__html: service.icon}}/>
                        <HStack alignment="right">
                            <Button
                                title={t(`Configure ${service.name}`)}
                                onClick={() => handleConfigModal(service, onRenderConfig)}
                                variant="secondary"
                                icon={settings}
                            />
                            <DropdownMenu icon={moreVertical} label="Select a direction">
                                {({onClose}) => (
                                    <>
                                        <MenuGroup>
                                            <Button
                                                style={{width: 200}}
                                                icon={settings}
                                                onClick={() => handleConfigModal(service, onRenderConfig)}

                                            >
                                                {t('Settings')}
                                            </Button>
                                            <Button
                                                style={{width: 200}}
                                                disabled={false === connected || !Object.values(activated.activated).includes(service.key)}
                                                icon={send}
                                                onClick={handleSetTest}
                                            >
                                                {t('Send a test email')}
                                            </Button>
                                        </MenuGroup>
                                        <MenuGroup>
                                            <Button
                                                style={{width: 200}}
                                                disabled={false === connected || !Object.values(activated.activated).includes(service.key)}
                                                icon={check}
                                                onClick={handleSetPrimary}
                                            >
                                                {t('Set as primary')}
                                            </Button>
                                        </MenuGroup>
                                    </>
                                )}
                            </DropdownMenu>
                        </HStack>
                    </div>
                    <Heading level={4}>{service.name}</Heading>
                    <Text
                        truncate={true}
                        numberOfLines={4}
                        variant="muted"
                    >{service.description}</Text>
                    {activated.default_service && activated.default_service === service.key &&
                        <>
                            <Spacer/>
                            <Tag type="info" withPoint={true}>
                                {t('Primary')}
                            </Tag>
                        </>
                    }
                </div>
                <div className="mailerpress-card__bottom-container footer">
                    <HStack justify="space-between">
                        <Flex gap={2} align="center" expanded={false}>
                            <Text>
                                {connected ? t('Configured') : t('Not configured')}
                            </Text>
                            <span
                                className={cx({
                                    'mailerpress-indicator': true,
                                    'mailerpress-indicator--dot': true,
                                    'mailerpress-indicator--success': connected && activated.activated && Object.values(activated.activated).includes(service.key),
                                    'mailerpress-indicator--error': !connected,
                                    'mailerpress-indicator--warning': connected && activated.activated && !Object.values(activated.activated).includes(service.key),
                                })}
                            />
                        </Flex>

                        <ToggleControl
                            label={""}
                            __nextHasNoMarginBottom
                            checked={
                                activated.activated ? Object.values(activated.activated).includes(service.key) : false
                            }
                            onChange={toggleEmailService}
                        />
                    </HStack>
                </div>
            </div>
        )
    }

    const handleRenderConfig = service => {

        const onSave = async (data) => {
            const result = await apiFetch({
                path: '/mailerpress/v1/connect-provider',
                method: 'POST',
                data: {
                    key: service.key,
                    config: {
                        conf: data
                    }
                }
            })
            pushToast({
                title: t('Your settings have been saved.'),
                type: 'success',
                duration: 5
            })
            setModal(null)
            setActivated(result)
            setData(result)
        }


        switch (service.key) {
            case 'mailerpress':
                return (
                    <MailerPressConfig
                        onSave={onSave}
                        activated={activated}
                    />
                )
            case 'php':
                return (
                    <PhpConfig
                        onSave={onSave}
                        activated={activated}
                    />
                )
            case 'sendgrid':
                return (
                    <SendGridConfig
                        onSave={onSave}
                        activated={activated}
                    />
                )
            case 'brevo':
                return (
                    <BrevoConfig
                        onSave={onSave}
                        activated={activated}
                    />
                )
            case 'smtp':
                return (
                    <SmtpConfig
                        onSave={onSave}
                        activated={activated}
                    />
                )
        }
    }

    const isConnected = (key) => {
        return activated.services[key] !== undefined && activated.services[key].conf !== null
    }


    return (
        <ComponentWrapper desc="Choose your preferred email sending option." mainTitle={"Sending services"}>

            {activated.activated && activated.activated.length === 0 &&

                <Notice isDismissible={false} status={"error"}>
                    <React.Fragment key=".0">
                        <HStack expanded={false} justify={"flex-start"}>
                            <div
                                style={{
                                    fill: '#cc1718',
                                    display: 'flex',
                                }}
                            >
                                <Icon icon={warning}/>
                            </div>
                            <Text weight="bold">
                                {t('No email service is currently configured.')}
                            </Text>
                        </HStack>
                        <Text>
                            {t('If no email service provider is active, you will not be able to send emails')}
                        </Text>
                    </React.Fragment>
                </Notice>
            }

            <Spacer marginY={4}/>
            <Grid columns={4} alignment={"center"} justify={"center"}>
                {
                    window.jsVars.esp.map(service =>
                        <SenderProvider
                            connected={isConnected(service.key)}
                            service={service}
                            onRenderConfig={() => handleRenderConfig(service)}
                        />
                    )}
            </Grid>
        </ComponentWrapper>
    )
}
export default SendingConf