import React, {useEffect, useMemo, useRef, useState} from "react"
import {useDispatch, useSelect} from "@wordpress/data";
import {blockType, STORE_KEY} from "../constants.ts";
import mjml2html from "mjml-browser";
import {JsonToMjml} from "../utils/JsonToMjml.ts";
import {ApiService} from "../core/apiService.ts";
import {__, sprintf, _n} from "@wordpress/i18n";
import {
    Button,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    FormTokenField,
    __experimentalText as Text, Icon, ToggleControl, DateTimePicker,
    __experimentalInputControl as InputControl,
    SelectControl,
} from "@wordpress/components";
import {send, people} from "@wordpress/icons";
import {useToasts} from "../hooks/useToasts.ts";
import dayjs from "dayjs";
import cx from "classnames/bind";

export const maybeRegenerateQuery = async (data) => {
    const updatedChildren = await Promise.all(
        data.children.map(async (b) => {
            if (b && b.type === blockType.QUERY && b.data.selection === 'auto') {
                const posts = await ApiService.fetchPosts(b.data.query);
                return {
                    ...b,
                    data: {
                        ...b.data,
                        posts
                    }
                };
            }
            return b;
        })
    );

    return {
        ...data,
        children: updatedChildren
    };
}

const Sidebar = ({onContactChange, emailConfig, data, fonts, mappingFont, postEdit, setModal}) => {
    const {pushToast} = useToasts();
    const [values, setValues] = useState([])
    const [contacts, setContacts] = useState(null)
    const {setEmailConfig, setEditMode, selectBlock} = useDispatch(STORE_KEY)
    const [lists, setList] = useState(
        window.jsVars.lists.filter(list => list.list_id === emailConfig.config.campaignList).reduce((acc, item) => {
            acc.push(item.name)
            return acc
        }, [])
    )
    const [sendType, setSendType] = useState(emailConfig.config.sendChoice)
    const [scheduledAt, setScheduledAt] = useState(emailConfig.config.sendAt || Date.now)
    const [busy, setBusy] = useState(false)

    const defaultService = useMemo(() => {
        const {default_service, services} = window.jsVars.emailServiceConfiguration
        return services[default_service]
    }, [])

    const [config, setConfig] = useState({
        fromName: defaultService.conf.default_name,
        fromTo: defaultService.conf.default_email,
        subject: emailConfig.config.campaignSubject,
    })

    useEffect(() => {
        const tagsSelected = window.jsVars.contactTags.filter(s => values.includes(s.name))
        const listsSelected = window.jsVars.lists.filter(s => lists.includes(s.name))

        if (listsSelected.length > 0) {
            ApiService.findContactWithTags(
                tagsSelected.reduce((acc, item) => {
                    acc.push(item['tag_id'])
                    return acc
                }, []),
                listsSelected.reduce((acc, item) => {
                    acc.push(item['list_id'])
                    return acc
                }, [])
            ).then(res => {
                setContacts(res)
                onContactChange(res)
            })
        } else {
            setContacts(null)
            onContactChange([])
        }

    }, [values, lists]);

    const createBatch = () => {
        setBusy(true)

        maybeRegenerateQuery(data).then(updatedData => {
            const result = mjml2html(
                JsonToMjml(updatedData, 'live', fonts, mappingFont)
            );
            ApiService.createBatch(
                contacts.reduce((acc, item) => {
                    acc.push(item['contact_id'])
                    return acc
                }, []),
                postEdit,
                result.html,
                config,
                scheduledAt,
                sendType
            ).then(res => {
                selectBlock(null)
                setEditMode('live')
                setModal(null)
                setTimeout(() => {
                    pushToast({
                        title: sendType === 'future' ? __('Your newsletter is scheduled', 'mailerpress') : __('Your newsletter is on it\'s way', 'mailerpress'),
                        type: 'success',
                        duration: 5
                    })
                }, 100)
                setEmailConfig({
                    emailConfig,
                    status: 'publish'
                })
            })
        });
    }

    return (
        <div style={{
            flex: '1 1 0%',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            borderRadius: 8,
            gap: 16,
            justifyContent: 'space-between',
            overflow: 'auto'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                padding: 8,

            }}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    <FormTokenField
                        __experimentalShowHowTo={false}
                        __experimentalExpandOnFocus
                        __nextHasNoMarginBottom
                        label={__('Select contact list', 'mailerpress')}
                        onChange={setList}
                        suggestions={window.jsVars.lists.reduce((acc, item) => {
                            acc.push(item.name)
                            return acc
                        }, [])}
                        value={lists}
                    />

                    <FormTokenField
                        __experimentalShowHowTo={false}
                        __experimentalExpandOnFocus
                        __nextHasNoMarginBottom
                        label={__('Select contact tags', 'mailerpress')}
                        onChange={setValues}
                        suggestions={window.jsVars.contactTags.reduce((acc, item) => {
                            acc.push(item.name)
                            return acc
                        }, [])}
                        value={values}
                    />
                    {contacts &&
                        <HStack expanded={false} justify={"flex-start"} spacing={1}>
                            <Icon icon={people}/>
                            <Text weight={"bold"}>
                                {
                                    sprintf(
                                        _n('%d contact found', '%d contacts found', contacts.length, 'mailerpress'),
                                        contacts.length
                                    )
                                }
                            </Text>
                        </HStack>
                    }
                </div>
                <div>
                    <HStack alignment={"top"}>
                        <InputControl
                            label={__('From name', 'mailerpress')}
                            value={config.fromName}
                            onChange={fromName => setConfig({...config, ...{fromName}})}
                        />
                        <InputControl
                            label={__('From to', 'mailerpress')}
                            value={config.fromTo}
                            onChange={fromName => setConfig({...config, ...{fromName}})}
                        />
                    </HStack>
                </div>
                <div>
                    <InputControl
                        label={__('Subject', 'mailerpress')}
                        value={config.subject}
                        onChange={subject => setConfig({...config, ...{subject}})}

                    />
                </div>
                <div>
                    <ToggleControl
                        help={sendType !== 'now' ? dayjs(scheduledAt).format('DD/MM/YYYY') : ''}
                        __nextHasNoMarginBottom
                        label={__('Schedule it?', 'mailerpress')}
                        checked={sendType !== 'now'}
                        onChange={val => setSendType(true === val ? 'future' : 'now')}
                    />
                    {
                        sendType !== 'now' && <div style={{
                            padding: 8, background: '#f7f7f7',
                            borderRadius: 6,
                            marginTop: 8
                        }}>
                            <DateTimePicker
                                currentDate={scheduledAt}
                                onChange={setScheduledAt}
                            />
                        </div>
                    }
                </div>
            </div>
            <div style={{
                position: 'sticky',
                bottom: 0,
                background: "#fff",
                padding: 8,
            }}>
                <HStack justify={"center"}>
                    <Button
                        onClick={createBatch}
                        variant={'primary'}
                        disabled={contacts === null || contacts.length === 0}
                        icon={send}
                        isBusy={busy}
                    >
                        {sendType === 'now' ? __('Send now', 'mailerpress') : __('Schedule sending', 'mailerpress')}
                    </Button>
                </HStack>
            </div>

        </div>
    )
}


const ReviewAndSend = ({data, postEdit, emailConfig}) => {
    const [preview, setPreview] = useState('desktop')
    const frame = useRef();
    const {setModal} = useDispatch(STORE_KEY)
    const fonts = useSelect((select) => select(STORE_KEY).getInstalledFont(), []);
    const mappingFont = useSelect((select) => select(STORE_KEY).getFonts(), []);
    const [previewContactList, setPreviewContactList] = useState([])

    useEffect(() => {
        maybeRegenerateQuery(data).then(updatedData => {
            const result = mjml2html(
                JsonToMjml(updatedData, 'live', fonts, mappingFont)
            );

            if (frame.current) {
                frame.current.contentDocument.body.innerHTML = result.html;
            }
        });
    }, []);

    const handlePreviewList = data => {
        if (data.length > 0) {
            setPreviewContactList(data.slice(0, 5))
        } else {
            setPreviewContactList([])
        }
    }

    const handlePreviewContactMail = contact => {
        if (contact === '') {
            maybeRegenerateQuery(data).then(updatedData => {
                const result = mjml2html(
                    JsonToMjml(updatedData, 'live', fonts, mappingFont)
                );

                if (frame.current) {
                    frame.current.contentDocument.body.innerHTML = result.html;
                }
            });
        } else {
            maybeRegenerateQuery(data).then(updatedData => {
                const result = mjml2html(
                    JsonToMjml(updatedData, 'live', fonts, mappingFont)
                );

                ApiService.previewContactCampaign({
                    contact,
                    html: result.html
                }).then(html => {
                    if (frame.current) {
                        frame.current.contentDocument.body.innerHTML = html;
                    }
                })
            });
        }
    }

    return (
        <div className={"mailerpress-review-email"} style={{
            background: '#f7f7f7',
            display: 'flex',
            justifyContent: 'center',
            padding: 8,
            borderRadius: 8,
            flex: 1,

        }}>
            <HStack spacing={4} alignment={"top"}>
                <VStack spacing={1} alignment={"center"} justify={'space-between'}
                        style={{width: '75%', height: '100%'}}>
                    <HStack alignment="top" justify="space-between">
                        {previewContactList.length > 0 &&
                            <SelectControl
                                help={__('Simulate the rendering that one of your contacts will receive', 'mailerpress')}
                                onChange={handlePreviewContactMail}
                                options={
                                    previewContactList.reduce((acc, item) => {
                                        acc.push({
                                            label: item.email,
                                            value: item.contact_id
                                        })
                                        return acc
                                    }, [{label: __('Select a value'), value: ''}])
                                }
                            />
                        }
                        <ToggleGroupControl
                            hideLabelFromVision
                            isBlock
                            onChange={setPreview}
                            value={preview}
                        >
                            <ToggleGroupControlOption
                                label={__('Desktop', 'mailerpress')}
                                value="desktop"
                            />
                            <ToggleGroupControlOption
                                label={__('Mobile', 'mailerpress')}
                                value="mobile"
                            />
                        </ToggleGroupControl>
                    </HStack>
                    <div className={cx({frame: true, 'frame--mobile': preview === 'mobile'})}>
                        <iframe style={{width: '100%', height: '100%'}} ref={frame} frameBorder="0"/>
                    </div>
                </VStack>
                <Sidebar
                    onContactChange={handlePreviewList}
                    emailConfig={emailConfig}
                    data={data}
                    fonts={fonts}
                    mappingFont={mappingFont}
                    postEdit={postEdit}
                    setModal={setModal}
                />
            </HStack>
        </div>
    )
}
export default ReviewAndSend