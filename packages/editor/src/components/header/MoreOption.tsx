import {
    Popover,
    ToolbarButton,
    __experimentalText as Text,
    __experimentalHStack as HStack,
    MenuGroup, MenuItem, Button, TextareaControl, Notice
} from "@wordpress/components";
import {Icon, moreVertical, external, check} from "@wordpress/icons";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {notAvailableMJMLComponents, STORE_KEY} from "../../constants.ts";
import {MjmlToJson} from "../../utils/MjmlToJson.ts";
import {useDispatch, useSelect} from "@wordpress/data";
import {__} from "@wordpress/i18n";
import BlockManager from "../../core/BlockManager.ts";
import {groupBy} from "lodash";
import FontManager from "../FontManager.tsx";

export const Uploader = ({setModal}) => {
    const [code, setCode] = useState('');
    const {replaceContent} = useDispatch(STORE_KEY)
    const [error, setError] = useState(null)
    const onImport = () => {
        /** TODO: validate code before importing **/
        if (code !== '') {
            try {
                replaceContent(MjmlToJson(code))
                setModal(null)
            } catch (error) {
                const errorSplitted = error.message.split(' ')
                setError(`mj-${errorSplitted[0]} TAG no supported yet`);
            }
        }
    }

    return (
        <div>
            <TextareaControl
                rows={30}
                help={
                    `Please note that this MJML components (${notAvailableMJMLComponents.join(', ')}) are not avaiblable for now`
                }
                label="Code"
                onChange={setCode}
                value={code}
            />
            {error && <div style={{marginBottom: 12}}>
                <Text isDestructive={true} isBlock={true}>
                    {error}
                </Text>
            </div>}
            <Button variant={"primary"} onClick={onImport}>Import</Button>
        </div>
    )
}

export const TemplatesLibrary = () => {
    const [templateList, setTemplateList] = useState(
        {
            templates: BlockManager.getTemplates(),
            category: 'all'
        }
    )

    const {templatesCategories} = useSelect(select => {
        return {
            templatesCategories: select(STORE_KEY).getTemplatesCategories(),
        }
    }, [])

    const renderCategoryLabel = (key) => {
        if (templatesCategories && templatesCategories[key]) {
            return templatesCategories[key].label
        }

        return ''
    }

    const showTemplates = (category) => {
        if (category === 'all') {
            setTemplateList(() => {
                return {templates: BlockManager.getTemplates(), category: 'all'}
            })
        } else {
            const group = groupBy(BlockManager.getTemplates(), "category")
            setTemplateList(() => {
                return {templates: group[category], category}
            })
        }
    }


    const TemplateItem = ({template}) => {
        const {replaceContent, setModal} = useDispatch(STORE_KEY)

        const FrameView = ({html}) => {
            const iframe = useRef();
            useEffect(() => {
                if (iframe.current) {
                    iframe.current.contentDocument.body.innerHTML = html
                }
            }, [iframe]);

            return (
                <iframe
                    ref={iframe}
                    width={"100%"}
                    height={"100%"}
                />
            )
        }

        const loadTemplate = () => {
            setModal(null)
            replaceContent(template.json)
        }

        return (
            <>
                <div className="template-explorer__list__item">
                    <div className="preview">
                        <FrameView html={template.html}/>
                    </div>
                    <div>
                        <Text size={14} upperCase={true} weight={900}>{template.name}</Text>
                        <Button onClick={() => loadTemplate(template)} variant={"tertiary"}>Select</Button>
                    </div>
                </div>
            </>
        )
    }

    return (

        templateList.templates.length > 0 ?
            <div className="template-explorer">
                <div className={"template-explorer__sidebar"}>
                    <ToolbarButton
                        onClick={() => showTemplates('all')}
                        isPressed={templateList.category === 'all'}
                    >
                        All
                    </ToolbarButton>
                    {
                        Object.keys(groupBy(BlockManager.getTemplates(), "category")).map(category => <ToolbarButton
                            isPressed={templateList.category === category}
                            label={'Settings'}
                            onClick={() => showTemplates(category)}
                        >
                            {renderCategoryLabel(category)}
                        </ToolbarButton>)
                    }

                </div>
                <div className={"template-explorer__list"}>
                    {templateList && templateList.templates.map(template => <TemplateItem template={template}/>)}
                </div>
            </div> : <Notice
                isDismissible={false}
                status={"warning"}
            >
                <React.Fragment key=".0">
                    <Text isBlock={true}>
                        {__('No templates available at the moment','mailerpress')}
                    </Text>
                    <HStack>
                        <Text isBlock={true}>{__('You can go premium to access a library of templates','mailerpress')}</Text>
                        <Button variant={"secondary"} href={"#"} target={"_blank"}>
                            Go premium
                        </Button>
                    </HStack>
                </React.Fragment>
            </Notice>

    )
}

const MoreOption = ({data, onSaveTemplate}) => {
    const [isVisible, setIsVisible] = useState(false);

    const {setModal, setEditMode} = useDispatch(STORE_KEY)
    
    const {editMode, fontsInstalled} = useSelect(select => {
        return {
            editMode: select(STORE_KEY).getEditMode(),
            fontsInstalled: select(STORE_KEY).getInstalledFont(),
        }
    }, [])

    const handleChangeEditMode = useCallback(() => {
        if (editMode === 'live') {
            setEditMode('builder')
        } else {
            setEditMode('live')
        }
    }, [editMode])

    const toggleVisible = () => {
        setIsVisible((state) => !state);
    };

    const openModalUploadMjmlCode = () => {
        setModal({
            title: 'Upload MJML code',
            component: <Uploader setModal={setModal}/>
        })
    }

    const openFontManager = () => {
        setModal({
            className: "mailerpress-font-modal",
            title: __('Fonts', 'mailerpress'),
            component: <FontManager
                fontsApplied={fontsInstalled}
            />,
            size: 'large',
        })
    }

    const openModalTemplates = () => {
        setModal({
            title: 'Browse all template',
            component: <TemplatesLibrary/>
        })
    }

    const openLink = link => {
        window.open(link, "_blank");
    }

    return (
        <div>
            <ToolbarButton
                isPressed={isVisible}
                size='compact'
                icon={moreVertical}
                label={'Settings'}
                onClick={toggleVisible}
            >
                {isVisible && <Popover
                    onFocusOutside={toggleVisible}
                    focusOnMount={true}
                    placement="bottom-end"
                    offset={20}
                >
                    <div className={"more-option-menu"}>
                        {data.children.length > 0 &&
                            <MenuGroup label="View">
                                <MenuItem onClick={handleChangeEditMode} icon={editMode === 'builder' ? check : null}>
                                    {__('Edit mode', 'mailerpress')}
                                </MenuItem>
                                <MenuItem onClick={handleChangeEditMode} icon={editMode === 'live' ? check : null}>
                                    {__('Real mode', 'mailerpress')}
                                </MenuItem>
                            </MenuGroup>
                        }
                        <MenuGroup label="Editor">
                            <MenuItem onClick={openFontManager}>
                                {__('Font manager', 'mailerpress')}
                            </MenuItem>
                            <MenuItem onClick={openModalUploadMjmlCode}>
                                {__('Upload MJML code', 'mailerpress')}
                            </MenuItem>
                            <MenuItem onClick={openModalTemplates}>
                                {__('Browse all templates', 'mailerpress')}
                            </MenuItem>
                            <MenuItem onClick={onSaveTemplate}>
                                {__('Save as template', 'mailerpress')}
                            </MenuItem>
                        </MenuGroup>
                        <MenuGroup label="Tools">
                            <MenuItem onClick={() => openLink('https://mailerpress.com/docs')}>
                                <div style={{
                                    justifyContent: 'space-between',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flex: 1
                                }}>
                                    Help
                                    <Icon icon={external}/>
                                </div>
                            </MenuItem>
                        </MenuGroup>
                    </div>
                </Popover>}
            </ToolbarButton>
        </div>
    )
}
export default MoreOption