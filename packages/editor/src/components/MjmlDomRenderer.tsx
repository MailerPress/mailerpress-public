import React, {useEffect, useMemo, useRef, useState} from 'react';
import {blockType, DATA_RENDER_COUNT, STORE_KEY} from '../constants.ts';
import mjml2html from "mjml-browser";
import {JsonToMjml} from "../utils/JsonToMjml.ts";
import FocusToolTipBlock from "../UI/interactive-tooltip/FocusToolTipBlock.tsx";
import {useDropBlock} from "../hooks/useDropBlock.ts";
import {
    Button,
    __experimentalText as Text,
    Notice,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    __experimentalSpacer as Spacer
} from "@wordpress/components";
import {addNewChild, generateBlockPattern} from "../utils/block.ts";
import BlockManager from "../core/BlockManager.ts";
import {useDispatch, useSelect, dispatch} from "@wordpress/data";
import {v4 as uuidv4} from 'uuid';
import {TemplatesLibrary, Uploader} from "./header/MoreOption.tsx";
import {__} from "@wordpress/i18n";
import {getEditorRoot} from "../utils/editorRoot.ts";
import {ApiService} from "../core/apiService.ts";
import {maybeRegenerateQuery} from "./ReviewAndSend.tsx";
import {arrowLeft, Icon, warning} from "@wordpress/icons";
import StartCampaignForm from "./StartCampaignForm.tsx";
import cx from "classnames/bind";
import ShadowRoot from '../UI/ShadowRoot.tsx';
import {useTheme} from "../context/Theme.tsx";
import {useToasts} from "../hooks/useToasts.ts";

let count = 0;

export function setCaretPosition(element, caretPosition) {
    const range = document.createRange();
    const selection = window.getSelection();
    let remainingLength = caretPosition;

    // Helper function to find the correct text node and set caret
    function findTextNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // If caret position is within this text node
            if (remainingLength <= node.length) {
                range.setStart(node, remainingLength);
                return true; // Position found
            } else {
                remainingLength -= node.length; // Move past this text node
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Special handling for <br> (line break) to ensure caret placement after it
            if (node.tagName === 'BR') {
                // If caret should be placed after this line break
                range.setStart(node, 0);
                return true; // Position found after <br>
            }

            // Traverse child nodes if it's an element node
            for (let child of node.childNodes) {
                if (findTextNode(child)) {
                    return true;
                }
            }
        }
        return false; // Caret position not found
    }

    // Start finding from the root element
    findTextNode(element);

    // If a valid position was found, apply the selection
    if (range.startContainer) {
        selection.removeAllRanges();
        selection.addRange(range);
        element.focus();
    }
}

const EmptyState = ({data, setModal}) => {
    const {addBlock, toggleBlockSidebar} = useDispatch(STORE_KEY)

    useEffect(() => {
        toggleBlockSidebar()
    }, []);

    const start = (config) => {
        const column = BlockManager.getBlockByType(blockType.COLUMN).init({})

        const generated = addNewChild(
            data,
            'page',
            BlockManager.getBlockByType(blockType.SECTION).init({
                clientId: uuidv4(),
                children: Array.from(config, (width) => {
                    return {
                        ...column,
                        clientId: uuidv4(),
                        children: [
                            BlockManager.getBlockByType(blockType.TEXT).init({
                                clientId: uuidv4(),
                            })
                        ],
                        attributes: {
                            width,
                            'vertical-align': 'middle'
                        },
                    }
                })
            }),
            'bottom'
        )

        if (BlockManager.getPatternById('pattern-footer-email')) {
            const footer = addNewChild(
                data,
                'page',
                generateBlockPattern(
                    BlockManager.getPatternById('pattern-footer-email').init({
                        id: 'pattern-footer-email',
                        type: 'pattern',
                        children: [],
                        clientId: uuidv4()
                    }),
                ),
                'bottom'
            )
            addBlock(footer)
        }

        addBlock(generated)

        toggleBlockSidebar()
    }

    return <div className="empty-state">
        <Text weight="bold" size="22px" upperCase={true}>
            {__('Your email is currently empty.', 'mailerpress')}
        </Text>
        <Text variant="muted" weight="normal" size="12px">
            {__('Please, choose below a layout to start with', 'mailerpress')}
        </Text>
        <ul>
            <li>
                <Button onClick={() => start([''])}>
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
                         aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                              d="m39.0625 14h-30.0625v20.0938h30.0625zm-30.0625-2c-1.10457 0-2 .8954-2 2v20.0938c0 1.1045.89543 2 2 2h30.0625c1.1046 0 2-.8955 2-2v-20.0938c0-1.1046-.8954-2-2-2z"></path>
                    </svg>
                </Button>
                <span>100</span>
            </li>
            <li>
                <Button onClick={() => start(['50%', '50%'])}>
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
                         aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                              d="M39 12C40.1046 12 41 12.8954 41 14V34C41 35.1046 40.1046 36 39 36H9C7.89543 36 7 35.1046 7 34V14C7 12.8954 7.89543 12 9 12H39ZM39 34V14H25V34H39ZM23 34H9V14H23V34Z"></path>
                    </svg>
                </Button>
                <span>50/50</span>
            </li>
            <li>
                <Button onClick={() => start(['33%', '66%'])}>
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
                         aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                              d="M39 12C40.1046 12 41 12.8954 41 14V34C41 35.1046 40.1046 36 39 36H9C7.89543 36 7 35.1046 7 34V14C7 12.8954 7.89543 12 9 12H39ZM39 34V14H20V34H39ZM18 34H9V14H18V34Z"></path>
                    </svg>
                </Button>
                <span>33/66</span>
            </li>
            <li>
                <Button onClick={() => start(['66%', '33%'])}>
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
                         aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                              d="M39 12C40.1046 12 41 12.8954 41 14V34C41 35.1046 40.1046 36 39 36H9C7.89543 36 7 35.1046 7 34V14C7 12.8954 7.89543 12 9 12H39ZM39 34V14H30V34H39ZM28 34H9V14H28V34Z"></path>
                    </svg>
                </Button>
                <span>66/33</span>
            </li>
            <li>
                <Button onClick={() => start(['33%', '33%', '33%'])}>
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
                         aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd"
                              d="M41 14a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h30a2 2 0 0 0 2-2V14zM28.5 34h-9V14h9v20zm2 0V14H39v20h-8.5zm-13 0H9V14h8.5v20z"></path>
                    </svg>
                </Button>
                <span>33/33/33</span>
            </li>
            <li>
                <Button onClick={() => start(['25%', '50%', '25%'])}>
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
                         aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd"
                              d="M41 14a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h30a2 2 0 0 0 2-2V14zM31 34H17V14h14v20zm2 0V14h6v20h-6zm-18 0H9V14h6v20z"></path>
                    </svg>
                </Button>
                <span>25/50/25</span>
            </li>
        </ul>
        <Text weight="bold" size="14px" variant={"muted"} upperCase={true}>Or</Text>
        <div className="actions">
            <Button onClick={() => setModal({
                title: 'Browse all template',
                component: <TemplatesLibrary setModal={setModal}/>
            })} variant="primary">Open template library</Button>
        </div>

    </div>
}

export function MjmlDomRender(props) {
    const [html, setHtml] = useState(null)
    const [finalHtmlHasError, setFinalHtmlHasError] = useState(false)
    const iframe = useRef(null)
    const {setRef, ref} = useDropBlock()
    const [postEdit, setPostEdit] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [containerReF, setContainerRef] = useState<HTMLDivElement | null>(null);
    const {pushToast} = useToasts()
    const {
        setModal,
        replaceContent,
        setEmailConfig,
        clearDraft
    } = useDispatch(STORE_KEY)

    const {data, previewMode, editMode, emailConfig, selectedBlock} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            previewMode: select(STORE_KEY).getPreviewMode(),
            editMode: select(STORE_KEY).getEditMode(),
            emailConfig: select(STORE_KEY).getEmailConfig(),
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
        }
    }, [])

    const canEdit = useMemo(() => {
        return emailConfig && (emailConfig.status === "draft" || emailConfig.status === undefined || emailConfig.title !== '')
    }, [emailConfig]);

    const fonts = useSelect((select) => select(STORE_KEY).getInstalledFont(), []);
    const mappingFont = useSelect((select) => select(STORE_KEY).getFonts(), []);
    const emailServiceConnected = Object.values(window.jsVars.emailServiceConfiguration.activated).includes(window.jsVars.emailServiceConfiguration.default_service)
    const {theme} = useTheme();

    useEffect(() => {
        maybeRegenerateQuery(data).then(updatedData => {
            const renderHtml = mjml2html(
                JsonToMjml(data, editMode, fonts, mappingFont, theme)
            );

            if (renderHtml.errors.length > 0) {
                setFinalHtmlHasError(true)
            } else {
                setFinalHtmlHasError(false)
            }

            if (iframe && iframe.current) {
                if (data.children.length > 0) {
                    iframe.current.contentDocument.body.innerHTML = renderHtml.html
                }
            }

            // if (data.children.length === 0 && typeof props.toggleSidebar === 'function') {
            //     props.toggleSidebar(false)
            //
            // }

            setHtml(renderHtml.html)
        });
    }, []);

    useEffect(() => {

        const renderHtml = mjml2html(
            JsonToMjml(data, editMode, fonts, mappingFont, theme)
        );

        if (editMode === 'live') {
            // alert()
        }

        if (renderHtml.errors.length > 0) {
            console.log(renderHtml.errors)
            setFinalHtmlHasError(true)
        } else {
            setFinalHtmlHasError(false)
        }

        if (iframe && iframe.current) {
            if (data.children.length > 0) {
                iframe.current.contentDocument.body.innerHTML = renderHtml.html
            }
        }

        setHtml(renderHtml.html)

    }, [data, iframe, editMode, previewMode, mappingFont]);

    useEffect(() => {
        if (isLoaded) {
            setRef(getEditorRoot())
        }
    }, [isLoaded]);

    useEffect(() => {
        if (data.children.length > 0 && postEdit === null) {
            const searchParams = new URLSearchParams(window.location.search);
            setPostEdit(searchParams.get('edit'))
        }
    }, [data, postEdit]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        if (!searchParams.get('edit')) {
            setIsLoaded(true)
        }

        if (searchParams.get('edit')) {
            setPostEdit(searchParams.get('edit'))
            ApiService.getCampaignById(searchParams.get('edit'))
                .then((post) => {
                    setEmailConfig({
                        ...post,
                        hasBatch: post.batch,
                        campaignName: post.title
                    })

                    const hasFooter = post.json.children.find((child) => child && child.id === 'pattern-footer-email')
                    if (undefined === hasFooter && BlockManager.getPatternById('pattern-footer-email')) {
                        const footer = addNewChild(
                            post.json,
                            'page',
                            generateBlockPattern(
                                BlockManager.getPatternById('pattern-footer-email').init({
                                    id: 'pattern-footer-email',
                                    type: 'pattern',
                                    children: [],
                                    clientId: uuidv4(),
                                    data: {
                                        lock: true
                                    }
                                }),
                            ),
                            'bottom'
                        )
                        replaceContent(
                            {
                                ...post.json,
                                footer
                            }
                        )
                    } else {
                        replaceContent(post.json)
                    }
                    setIsLoaded(true)
                })
                .catch(() => {
                    setIsLoaded(true)
                })
        }
    }, [])

    useEffect(() => {
        if (emailConfig === null && isLoaded) {
            setModal({
                headerActions: <HStack expanded={false}>
                    <Button href={`${jsVars.adminUrl}?page=mailerpress%2Fcampaigns.php&path=%2Fhome%2Fcampaigns`}
                            icon={arrowLeft}
                            variant={"tertiary"}>
                        {__('Back to list', 'mailerpress')}
                    </Button>
                </HStack>,
                isDismissible: false,
                title: __('Before begining...', 'mailerpress'),
                component: jsVars.pluginInited !== '' ? <StartCampaignForm/> : <Notice
                    status={"warning"}
                    isDismissible={false}
                    actions={[
                        {
                            label: 'Please setup the plugin before starting',
                            variant: 'secondary',
                            url: `${jsVars.adminUrl}?page=mailerpress/campaigns.php`
                        }
                    ]}
                />

            })
        } else {
            setModal(null)
        }
    }, [emailConfig, isLoaded]);

    const onGenerateHtml = (html) => {
        if (html) {
            const dom = new DOMParser().parseFromString(html, 'text/html');
            // Set contenteditable to true to all classes .node-type-text inside dom
            const editableNodes = [
                dom.querySelectorAll('.node-type-text > div'),
                dom.querySelectorAll('.node-type-heading > div'),
                dom.querySelectorAll('.node-type-button a'),
                dom.querySelectorAll('.node-type-button p'),
            ]

            editableNodes.forEach(nodes => {
                nodes.forEach(node => {
                    if (!node.closest('.lock-inline-editing')) {
                        node.setAttribute('contenteditable', 'true');
                    }
                })
            })

            const columns = dom.querySelectorAll('.node-type-column')

            if (previewMode === 'mobile') {
                dom.querySelector('.node-type-page ').classList.add('mobile-preview')
                columns.forEach(column => {
                    column.classList.add('mobile')
                })
            } else {

            }

            return dom.documentElement.outerHTML;
        }
    }

    useEffect(() => {
        if (selectedBlock && selectedBlock.block && props.sidebarOpen === false) {
            props.toggleSidebar(true)
        }
    }, [selectedBlock]);

    const hasDraft = useMemo(() => {
        if (localStorage.getItem('mailerpress_editor_state')) {
            if (JSON.stringify(data) !== localStorage.getItem('mailerpress_editor_state')) {
                return true
            }
        }

        return false;
    }, [data]);

    const restoreDraft = () => {
        replaceContent(JSON.parse(localStorage.getItem('mailerpress_editor_state')))
        pushToast({
            title: __('Draft saved succesfully', 'mailerpress'),
            status: 'success',
            duration: 1
        })
        clearDraft()
    }

    return useMemo(() => {
        return (
            <>
                {!canEdit &&
                    <div className="block-ui" style={{
                        width: '100vw',
                        height: '100vh',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 2040,
                        background: '#fff'
                    }}/>
                }
                <ShadowRoot
                    id='VisualEditorEditMode'
                >
                    <div
                        className={cx({
                            'shadow-container': true,
                            'is-mobile-view': previewMode === 'mobile'
                        })}
                        style={{
                            overflowY: 'auto',
                            zIndex: 10,
                            boxSizing: 'border-box',
                        }}
                        ref={setContainerRef}

                    >
                        <div
                            {...{
                                [DATA_RENDER_COUNT]: count++,
                            }}
                            style={{
                                outline: 'none',
                                position: 'relative',
                            }}
                            role='tabpanel'
                            tabIndex={0}
                        >
                            <>
                                {hasDraft &&
                                    <Notice
                                        onDismiss={() => clearDraft()}
                                        status="warning"
                                        isDismissible={true}
                                    >
                                        <VStack spacing={4} expanded={false} alignment={"left"}>
                                            <Text>
                                                {__('The backup of this email in your browser is different from the version below.', 'mailerpress')}
                                            </Text>
                                            <Button onClick={restoreDraft} variant={"secondary"}>
                                                {__('Restore the backup', 'mailerpress')}
                                            </Button>
                                        </VStack>
                                    </Notice>}

                                {finalHtmlHasError && editMode === 'builder' &&
                                    <Notice status="warning" isDismissible={false}>
                                        {__('It seems that the generated html code contains errors', 'mailerpress')}
                                    </Notice>}
                                {!emailServiceConnected &&
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
                                                    {__('Your primary sending service is disabled.', 'mailerpress')}
                                                </Text>
                                            </HStack>
                                            <Text>
                                                {__('MailerPress will therefore not be able to send your emails correctly. Please activate your default sending email or choose another active primary service.', 'mailerpress')}
                                            </Text>
                                            <Spacer marginTop={1}/>
                                            <Button target={"_blank"}
                                                    href={`${jsVars.adminUrl}?page=mailerpress%2Fcampaigns.php&path=%2Fhome%2Fsettings&activeView=Sending+services`}
                                                    variant={"link"}>
                                                Go to sending options
                                            </Button>
                                        </React.Fragment>
                                    </Notice>
                                }

                                <div id={"editor-root"}>
                                    {
                                        editMode === 'live' || (emailConfig && emailConfig.status !== "draft") ?
                                            <iframe
                                                ref={iframe}
                                                width={"100%"}
                                            />
                                            :
                                            <div
                                                dangerouslySetInnerHTML={{__html: onGenerateHtml(html)}}
                                            />
                                    }
                                </div>

                                {editMode === 'builder' &&
                                    <FocusToolTipBlock
                                        previewMode={previewMode}
                                        editMode={editMode}
                                    />
                                }

                                {isLoaded && data.children.length === 0 &&
                                    <EmptyState
                                        data={data}
                                        setModal={setModal}
                                    />
                                }
                            </>
                        </div>
                    </div>
                </ShadowRoot>
            </>
        );
    }, [html, editMode, previewMode, canEdit, data]);
}
