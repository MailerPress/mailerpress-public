import {
    __experimentalText as Text,
    __experimentalVStack as VStack,
    __experimentalHStack as HStack,
    Button,
    __experimentalInputControl as InputControl,
    SelectControl,
    Flex,
    FlexItem,
    FlexBlock,
} from '@wordpress/components'
import {__} from '@wordpress/i18n'
import {
    send,
    desktop,
    listView,
    mobile,
    drafts,
    copy,
    published, plus, check
} from '@wordpress/icons'
import apiFetch from "@wordpress/api-fetch";
import {dispatch, useDispatch, useSelect} from "@wordpress/data";
import {STORE_KEY} from "../constants.ts";
import Autosave from "../core/Autosave.tsx";
import {IEmailConfig} from "../interfaces/block-editor-state.ts";
import ReviewAndSend from "./ReviewAndSend.tsx";
import React, {useEffect, useMemo, useState} from "react";
import {removeAllClientId} from "../utils/block.ts";
import {ApiService} from "../core/apiService.ts";
import {useToasts} from "../hooks/useToasts.ts";
import cx from "classnames/bind";
import MoreOption from "./header/MoreOption.tsx";
import useInactivity from "../hooks/useInactivity.ts";

interface HeaderProps {
    toggleSidebar: () => void,
    sidebarOpen: boolean,
    postEdit: string | null,
    emailConfig: IEmailConfig,
    emailServiceConnected: boolean,
}

const CreatePattern = ({data}) => {
    const [templateName, setTemplateName] = useState('')
    const [templateCategory, setTemplateCategory] = useState('');
    const {pushToast} = useToasts();
    const {setModal} = useDispatch(STORE_KEY)

    const saveTemplate = () => {
        ApiService.saveTemplate({
            templateName,
            templateCategory,
            templateJSON: JSON.stringify(removeAllClientId(data))
        }).then(data => {
            pushToast({
                title: __('Template created successfully', 'mailerpress'),
                type: 'success',
                duration: 5
            })
            setModal(null)
        })
    }

    return (
        <VStack style={{width: '100%'}}>
            <InputControl
                value={templateName}
                label={__('Name', 'mailerpress')}
                onChange={setTemplateName}
            />
            <div style={{marginTop: 16}}>
                <SelectControl
                    value={templateCategory}
                    __nextHasNoMarginBottom
                    label={__('Category', 'mailerpress')}
                    onChange={setTemplateCategory}
                    options={[
                        {value: '', label: ''},
                        ...Object.entries(window.jsVars.templateCategories).reduce((acc, item) => {
                            acc.push({
                                label: item[1].label,
                                value: item[0]
                            })
                            return acc
                        }, [])
                    ]}
                />
            </div>
            <div style={{marginTop: 16}}>
                <HStack
                    expanded={false}
                    justify={'flex-end'}
                    spacing="3"
                >
                    <Button variant="tertiary">
                        {__('Cancel', 'mailerpress')}
                    </Button>
                    <Button disabled={templateName === '' || templateCategory === ''}
                            variant="primary"
                            onClick={() => saveTemplate()}>
                        {__('Add', 'mailerpress')}
                    </Button>
                </HStack>
            </div>
        </VStack>
    )
}

const HeaderMiddle = () => {
    const {emailConfig} = useSelect(select => {
        return {
            emailConfig: select(STORE_KEY).getEmailConfig(),
        }
    }, [])

    const canEdit = useMemo(() => {
        if (emailConfig === null) {
            return false
        }

        return emailConfig && emailConfig.status === "draft" || emailConfig.status === undefined
    }, [emailConfig]);


    return (
        <>
            {canEdit &&
                <div className="mailerpress-document-bar">
                    {
                        emailConfig && <Flex>
                            <FlexBlock>
                                <Text className={"title"} isBlock
                                      align={"center"}>{emailConfig.config.campaignName || emailConfig.campaignName}</Text>
                            </FlexBlock>
                            <FlexItem>
                                <Text>
                                    ⌘K
                                </Text>
                            </FlexItem>
                        </Flex>
                    }
                </div>
            }
        </>
    )
}

const HeaderLeft = () => {
    const [postEdit, setPostEdit] = useState(null)

    const {setTabs, setEmailConfig} = useDispatch(STORE_KEY)

    const {data, emailConfig, canUndo, canRedo, tabs, blockSidebarOpen} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            emailConfig: select(STORE_KEY).getEmailConfig(),
            canUndo: select(STORE_KEY).canUndo(),
            canRedo: select(STORE_KEY).canRedo(),
            tabs: select(STORE_KEY).getTabs(),
            blockSidebarOpen: select(STORE_KEY).blockSidebarOpen(),
        }
    }, [])

    useEffect(() => {
        if (data.children.length > 0 && postEdit === null) {
            const searchParams = new URLSearchParams(window.location.search);
            setPostEdit(searchParams.get('edit'))
        }
    }, [data, postEdit]);

    const canEdit = useMemo(() => {
        if (emailConfig === null) {
            return false
        }

        return emailConfig && emailConfig.status === "draft" || emailConfig.status === undefined
    }, [emailConfig]);

    const displayListView = () => {
        if (tabs.blocks === 2) {
            setTabs({
                ...tabs,
                blocks: 0
            })
        } else {
            setTabs({
                ...tabs,
                blocks: 2
            })
        }
    }

    useEffect(() => {
        localStorage.setItem('mailerpress_block_sidebar_diplayed', blockSidebarOpen)
    }, [blockSidebarOpen]);

    const renderStatus = () => {
        switch (emailConfig.status) {
            case 'sent':
                return <Button variant={"tertiary"} icon={published}>
                    {__('Sent', 'mailerpress')}
                </Button>
            default:
                return <Button variant={"tertiary"} icon={drafts}>
                    {__('Draft', 'mailerpress')}
                </Button>
        }
    }

    const onDone = () => {
        // selectBlock('91de5ef8-b1ad-47ac-baad-5ee74a7450b7')
    }

    return (
        <>
            {canEdit &&
                <HStack spacing={1}>
                    <Button
                        className={cx({
                            "mailerpress-block-library-toggler": true,
                            "mailerpress-block-library-toggler--is-open": blockSidebarOpen
                        })}
                        isPressed={blockSidebarOpen}
                        onClick={() => dispatch(STORE_KEY).toggleBlockSidebar()}
                        variant={'primary'}
                        icon={plus}
                    />
                    {/*<Button*/}
                    {/*    onClick={() => dispatch(STORE_KEY).undo()}*/}
                    {/*    disabled={!canUndo}*/}
                    {/*    icon={undo}*/}
                    {/*    label="Undo"*/}
                    {/*/>*/}
                    {/*<Button*/}
                    {/*    onClick={() => dispatch(STORE_KEY).redo()}*/}
                    {/*    disabled={!canRedo}*/}
                    {/*    icon={redo}*/}
                    {/*    label="Redo"*/}
                    {/*/>*/}
                    <Button
                        disabled={data && data.children && data.children.length === 0}
                        isPressed={tabs.blocks === 2}
                        onClick={displayListView}
                        icon={listView}
                        label="Redo"
                    />
                    {renderStatus()}
                </HStack>
            }
            {canEdit && data && data.children && data.children.length > 0 &&
                <Autosave
                    onDone={onDone}
                    emailConfig={emailConfig}
                    data={data}
                    postEdit={postEdit}
                    setEmailConfig={setEmailConfig}
                />
            }
        </>
    )
}

const HeaderRight = (props) => {
    const [postEdit, setPostEdit] = useState(null)
    const isInactive = useInactivity(10); // Set timeout in seconds
    const {editPreviewMode, setModal, replaceContent} = useDispatch(STORE_KEY)
    const {data, emailConfig, previewMode} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            emailConfig: select(STORE_KEY).getEmailConfig(),
            previewMode: select(STORE_KEY).getPreviewMode(),
        }
    }, [])
    const {pushToast} = useToasts()
    useEffect(() => {
        if (data.children.length > 0 && postEdit === null) {
            const searchParams = new URLSearchParams(window.location.search);
            setPostEdit(searchParams.get('edit'))
        }
    }, [data, postEdit]);

    const canEdit = useMemo(() => {
        if (emailConfig === null) {
            return false
        }

        return emailConfig && emailConfig.status === "draft" || emailConfig.status === undefined
    }, [emailConfig]);

    const emailServiceConnected = useMemo(() => {
        return Object.values(window.jsVars.emailServiceConfiguration.activated).includes(window.jsVars.emailServiceConfiguration.default_service)
    }, []);

    const onSend = () => {
        console.log(data)
        setModal({
            className: "modal-full-h",
            title: __('Review & Send', 'mailerpress'),
            component: <ReviewAndSend
                data={data}
                postEdit={postEdit}
                emailConfig={emailConfig}
            />
        })
    }

    const saveTemplate = () => {
        setModal({
            className: "modal-full-h",
            title: __('Add new template', 'mailerpress'),
            size: 'small',
            component: <CreatePattern data={data}/>
        })
    }

    const {clearDraft} = useDispatch(STORE_KEY);
    const onSaveDraft = () => {
        if (postEdit !== undefined || postEdit !== null) {
            return apiFetch({
                path: `/mailerpress/v1/campaign/save-content/${postEdit}`,
                method: 'PUT',
                data: {
                    content: JSON.parse(localStorage.getItem('mailerpress_editor_state'))
                },
            }).then(() => {
                replaceContent(JSON.parse(localStorage.getItem('mailerpress_editor_state')))
                pushToast({
                    title: __('Draft saved succesfully', 'mailerpress'),
                    status: 'success',
                    duration: 1
                })
                clearDraft()
            })
        }

    }

    const hasDraft = useSelect((select) => select(STORE_KEY).hasLocalStorageDraft(), []);

    // if (isInactive && localStorage.getItem('mailerpress_editor_state')) {
    //     onSaveDraft()
    // }

    return (
        <>
            {canEdit &&
                <div style={{display: "flex", alignItems: "center", gap: 8, marginRight: 8}}>
                    <Button
                        size={'compact'}
                        disabled={data.children.length === 0}
                        icon={previewMode === 'desktop' ? desktop : mobile}
                        onClick={() => previewMode === 'desktop' ? editPreviewMode('mobile') : editPreviewMode('desktop')}
                    />
                    {hasDraft ? <Button
                        size={'compact'}
                        variant="tertiary"
                        onClick={onSaveDraft}
                    >
                        {__('Save draft', 'mailerpress')}
                    </Button> : <Button
                        size={'compact'}
                        variant="seconday"
                        onClick={onSaveDraft}
                        icon={check}
                        disabled={true}
                    >
                        {__('Saved', 'mailerpress')}
                    </Button>}

                    <Button
                        size={'compact'}
                        disabled={data.children.length === 0 || !emailServiceConnected}
                        icon={send}
                        variant="primary"
                        onClick={onSend}
                    >
                        {__('Publish', 'mailerpress')}
                    </Button>
                    <MoreOption
                        onSaveTemplate={saveTemplate}
                        data={data}
                    />
                </div>
            }

            {!canEdit &&
                <div style={{display: "flex", alignItems: "center", gap: 8, marginRight: 8}}>
                    <Button
                        disabled={data.children.length === 0 || !emailServiceConnected}
                        icon={send}
                        variant="primary"
                        onClick={() => alert('Implement view stats')}
                    >
                        {__('View stats', 'mailerpress')}
                    </Button>
                    <Button
                        disabled={data.children.length === 0 || !emailServiceConnected}
                        variant="secondary"
                        icon={copy}
                        onClick={() => alert('Implement Duplicate')}
                    >
                        {__('Duplicate this campaign', 'mailerpress')}
                    </Button>
                </div>
            }
        </>
    )
}

export {HeaderMiddle, HeaderLeft, HeaderRight}