import React, {useCallback, useEffect, useMemo, useState} from 'react';
import EditorSkeleton, {HeaderConfig} from "../UI/Interfaces/EditorSkeleton.tsx";
import Sidebar from "../components/Sidebar.tsx";
import {MjmlDomRender} from "../components/MjmlDomRenderer.tsx";
import ToolBar from "../UI/interactive-tooltip/ToolBar.tsx";
import {blockType, DATA_RENDER_COUNT, STORE_KEY} from "../constants.ts";
import {Modal} from "@wordpress/components";
import {useDispatch, useSelect} from "@wordpress/data";
import SidebarFiller from "../components/SidebarFiller.tsx";
import BlockLibrary from "../components/BlockLibrary.tsx";
import {HeaderLeft, HeaderMiddle, HeaderRight} from "../components/Header.tsx";
import HoverToolTipBlock from "../UI/interactive-tooltip/HoverToolTipBlock.tsx";
import {convertToValidHex, findColorInsideThemePalette, findValueInsideTheme} from "../utils/style.ts";
import {useTheme} from "../context/Theme.tsx";
import {getPathToRoot, updateDataAndAttributes, wrapSectionInWrapper} from "../utils/block.ts";
import {useWarnOnUnsavedChanges} from "../hooks/useWarnOnUnsavedChanges.tsx";
import {KeyboardShortcuts} from '@wordpress/components';
import apiFetch from "@wordpress/api-fetch";
import {useToasts} from "../hooks/useToasts.ts";
import {__} from "@wordpress/i18n"

const MailerPressEmailBuilder = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const {theme, toggleTheme} = useTheme();
    useWarnOnUnsavedChanges("mailerpress_editor_state");
    const {pushToast} = useToasts();

    const handleToggleSidebar = useCallback(() => {
        setSidebarOpen(!sidebarOpen)
    }, [sidebarOpen]);

    const {
        setModal,
        selectBlock,
        editBlock,
        clearDraft,
        replaceContent,
        addBlock
    } = useDispatch(STORE_KEY)

    const {data, selectedBlock, previewMode, modal, editMode, emailConfig} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
            previewMode: select(STORE_KEY).getPreviewMode(),
            modal: select(STORE_KEY).getModal(),
            editMode: select(STORE_KEY).getEditMode(),
            emailConfig: select(STORE_KEY).getEmailConfig(),
        }
    }, [])

    useEffect(() => {
        const style = window.jsVars.themeStyles[theme]
        if (style) {
            const page = [data].find(b => b.type === blockType.PAGE)
            if (page) {
                editBlock(
                    updateDataAndAttributes(
                        data,
                        page.clientId,
                        {
                            data: {
                                ...page.data,
                                ...{
                                    color: findColorInsideThemePalette(style, 'styles > color > text'),
                                    button: findColorInsideThemePalette(style, 'styles > elements > button > color > background'),
                                    buttonColor: findColorInsideThemePalette(style, 'styles > elements > button > color > text'),
                                    link: findColorInsideThemePalette(style, 'styles > elements > link > color > text'),
                                    buttonRadius: findValueInsideTheme(style, 'styles > elements > button > border > radius'),
                                    spacerBorderColor: convertToValidHex(findColorInsideThemePalette(style, 'styles > blocks > core/separator > color > text'))
                                }
                            },
                            attributes: {
                                'background-color': findColorInsideThemePalette(style, 'styles > color > background')
                            }
                        }
                    )
                )
            }
        }

    }, [theme]);

    const closeModal = () => {
        setModal(null)
    }

    const root = useMemo(() => {
        return selectedBlock && selectedBlock.block ? document.querySelector(`[${DATA_RENDER_COUNT}]`) : null;
    }, [selectedBlock]);

    useEffect(() => {
        if (!root) return;
        let lastCount: any = '0';
        const ms = new MutationObserver(() => {
            const currentCount = root.getAttribute(DATA_RENDER_COUNT);
            if (lastCount !== currentCount) {
                selectBlock(selectedBlock.block.clientId)
            }
        });
        ms.observe(root, {
            attributeFilter: [DATA_RENDER_COUNT],
        });

        return () => {
            ms.disconnect();
        };
    }, [selectedBlock]);

    const header: HeaderConfig = {
        middle: <HeaderMiddle/>,
        left: <HeaderLeft/>,
        right: <HeaderRight/>
    };

    const canEdit = useMemo(() => {
        return emailConfig && emailConfig.status === "draft"
    }, [emailConfig]);

    const openCommandPalette = () => {
        if (modal === null) {
            setModal({
                className: "modal-full-h",
                size: 'small',
                component: null
            })
        } else {
            setModal(null)
        }

    }

    const unselectBlock = () => {
        if (selectedBlock && selectedBlock.block) {
            selectBlock(null)
        }
    }

    const onDeleteAllContent = e => {
        e.preventDefault()
    }

    const saveDraft = e => {
        e.preventDefault()
        const searchParams = new URLSearchParams(window.location.search);
        const postEdit = searchParams.get('edit')
        if (postEdit !== undefined && localStorage.getItem('mailerpress_editor_state')) {
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

    const transformSelectedSectionInsideWrapper = e => {
        e.preventDefault()
        if (undefined === getPathToRoot(data, selectedBlock.block.clientId).find(p => p.type === 'wrapper')) {
            if (selectedBlock && selectedBlock.block.type === blockType.SECTION) {
                const newData = wrapSectionInWrapper(
                    data,
                    selectedBlock.block.clientId,
                    selectedBlock.block
                );
                addBlock(newData)
            }
        }
    }

    return (
        <div>
            <KeyboardShortcuts
                bindGlobal={true}
                shortcuts={{
                    'mod+k': openCommandPalette,
                    'mod+s': saveDraft,
                    'mod+a': onDeleteAllContent,
                    'ctrl+shift+w': transformSelectedSectionInsideWrapper,
                    'esc': unselectBlock
                }}
            />

            {editMode === 'builder' && selectedBlock && selectedBlock.block && selectedBlock.block.type !== 'page' &&
                <ToolBar
                    selectedBlock={selectedBlock}
                    previewMode={previewMode}
                />
            }

            <SidebarFiller/>

            {modal && (
                <Modal
                    className={modal.className || ''}
                    headerActions={modal.headerActions}
                    size={modal.size || 'fill'}
                    isDismissible={modal.isDismissible ?? true}
                    title={modal.title}
                    onRequestClose={(modal.isDismissible || modal.isDismissible === undefined) ? closeModal : null}
                >
                    {modal.component}
                </Modal>
            )}

            <EditorSkeleton
                isEditable={canEdit}
                header={header}
                toggleSidebar={handleToggleSidebar}
                sidebarOpen={sidebarOpen}
                hasLeftSidebar={true}
                sidebar={<Sidebar/>}
                content={<MjmlDomRender isEditable={canEdit}/>}
                leftArea={<BlockLibrary/>}
            />

            <HoverToolTipBlock/>

        </div>
    );
};

export default MailerPressEmailBuilder;