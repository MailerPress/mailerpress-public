import {registerBlockType} from "../../regisetBlockType.ts";
import {v4 as uuidv4} from 'uuid';
import {blockType as blockTypeEnum, blockType, STORE_KEY} from "../../../constants.ts";
import {
    __experimentalText as Text,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption, Button,
    PanelBody,
    SelectControl,
    ToolbarButton
} from '@wordpress/components';
import decode from "unescape"
import {__} from "@wordpress/i18n";
import {merge} from "lodash";
import {RangeControl} from "../../../UI/Settings/index.ts";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import ToolBar from "../../../UI/interactive-tooltip/ToolBar.tsx";
import {t} from "../../../utils/function.ts";
import BlockManager, {TQueryPattern} from "../../BlockManager.ts";
import {QueryControl} from "../../../UI/Settings/QueryControl.tsx";
import {PatternRenderer} from "../../../components/PatternRenderer.tsx";
import {usePrevious} from "../../../hooks/usePrevious.ts";
import {useDispatch, useSelect} from "@wordpress/data";
import {ApiService} from "../../apiService.ts";
import mjml2html from "mjml-browser";
import {JsonToMjml} from "../../../utils/JsonToMjml.ts";
import {MjmlToJson} from "../../../utils/MjmlToJson.ts";
import {
    generateBlockPattern,
    replaceBlockByClientId,
} from "../../../utils/block.ts";
import {SearchControl} from "../../../UI/Settings/SearchControl.tsx";

const QueryPatternsLibrary = ({queryPatterns}) => {
    const [searchPattern, setSearchPattern] = useState('')
    const {setModal, editBlock} = useDispatch(STORE_KEY)
    const {selectedBlock, data} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
        }
    }, [])

    const QueryPatternItem = ({template}) => {
        const FrameView = () => {
            const iframe = useRef();
            useEffect(() => {
                if (iframe.current) {
                    const html = mjml2html(
                        JsonToMjml(
                            BlockManager.getBlockByType(blockTypeEnum.PAGE).init({
                                children: [
                                    {
                                        ...MjmlToJson(
                                            decode(
                                                wp.element.renderToString(
                                                    template.preview(
                                                        template.init({
                                                            "preview": true,
                                                            'data': {
                                                                'selection': 'auto',
                                                                'displayMode': 'column',
                                                                'columnSize': 2,
                                                                'pattern': template.id,
                                                                'query': {
                                                                    'postType': 'posts',
                                                                    'per_page': 3,
                                                                    'order': 'date/desc',
                                                                },
                                                                'posts': window.jsVars.latestPosts
                                                            },
                                                        })
                                                    )
                                                )
                                            )
                                        )
                                    }
                                ]
                            })
                        )
                    ).html

                    iframe.current.contentDocument.body.innerHTML = html
                }
            }, [iframe]);

            return (
                <iframe
                    style={{
                        transformOrigin: 'top left',
                        transform: 'scale(0.5)',
                        width: '200%',
                        height: '200%'
                    }}
                    ref={iframe}
                    width={"100%"}
                    height={"100%"}
                />
            )
        }

        const selectQueryPattern = (node: TQueryPattern) => {
            setModal(null)
            editBlock(
                replaceBlockByClientId(
                    data,
                    selectedBlock.block.children[0].clientId,
                    generateBlockPattern(
                        node.init({
                            type: 'query-pattern',
                            id: node.id,
                            children: [],
                            clientId: uuidv4()
                        }),
                    ),
                )
            )
            // replaceContent(template.json)
        }

        return (
            <>
                <div className="template-explorer__list__item">
                    <div className="preview" style={{
                        aspectRatio: '16 / 9'
                    }}>
                        <FrameView/>
                    </div>
                    <div>
                        <Text size={14} upperCase={true} weight={900}>{template.name}</Text>
                        <Button onClick={() => selectQueryPattern(template)} variant={"tertiary"}>Select</Button>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <div>
                <SearchControl
                    value={searchPattern}
                    onChange={setSearchPattern}
                />
                <div className={"template-explorer__list"} style={{padding: 0, marginTop: 16}}>
                    {queryPatterns && queryPatterns.map(template => <QueryPatternItem template={template}/>)}
                </div>
            </div>
        </>
    )
}

const preview = (params) => {
    /** Todo: default view if not pattern defined **/
    const {data, children} = params
    const Pattern = BlockManager.getQueryPatternById(data.pattern)

    return Pattern ? <PatternRenderer
        data={{
            ...children[0],
            data: {
                ...children[0].data,
                ...data
            }
        }}
    /> : null
}

const Edit = (props) => {
    const {data} = props.block
    const {setData} = props
    const [pattern, setPattern] = useState(data.pattern)
    const previousData = usePrevious(data)
    let isFetching = false;

    const {setModal} = useDispatch(STORE_KEY)

    useEffect(() => {
        if (previousData === undefined && data.selection === 'auto') {
            ApiService.fetchPosts(data.query).then(posts => {
                setData({posts})
            })
        } else if (previousData !== undefined && previousData.selection !== data.selection && data.selection === 'auto') {
            ApiService.fetchPosts(data.query).then(posts => {
                setData({posts})
            })
        }

    }, [data, previousData]);

    useEffect(() => {
        if (previousData !== undefined && JSON.stringify(previousData.query) !== JSON.stringify(data.query)) {
            ApiService.fetchPosts(data.query).then(posts => {
                setData({posts})
            })
        }
    }, [data.query]);

    useEffect(() => {
        if (previousData && (previousData.selection !== data.selection)) {
            setData({posts: []})
        }
    }, [data.selection]);

    const queryPatterns = useMemo(() => {
        const patterns = BlockManager.getQueryPatterns()
        return [
            ...patterns
        ];
    }, [])

    const openModalQueryPattern = () => {

        setModal({
            title: 'Choose a pattern',
            component: <QueryPatternsLibrary queryPatterns={queryPatterns}/>
        })
    }

    return (
        <>
            <ToolBar.Fill>
                <ToolbarButton onClick={openModalQueryPattern}>
                    {__('Change pattern','mailerpress')}
                </ToolbarButton>
            </ToolBar.Fill>
            <PanelBody title={"Configuration"}>
                {pattern ?
                    <>
                        <ToggleGroupControl
                            value={data.selection}
                            __nextHasNoMarginBottom
                            isBlock
                            label="Selection"
                            onChange={val => setData({selection: val})}
                        >
                            <ToggleGroupControlOption
                                label="Automatique"
                                value="auto"
                            />
                            <ToggleGroupControlOption
                                label="Manuelle"
                                value="manual"
                            />

                        </ToggleGroupControl>

                        {data.selection === "auto" && <QueryControl {...props} />}

                        {data.selection === "manual" && <SearchControl
                            {...props}
                            value={data.posts}
                            onChange={posts => setData({posts})}
                        />}
                    </> : <>
                        <div style={{flex: 1}}>
                            <SelectControl
                                label={"Pattern"}
                                onChange={(pattern) => props.setData({pattern})}
                                options={
                                    queryPatterns.reduce((acc, pattern: TQueryPattern) => {
                                        acc.push({
                                            label: pattern.name,
                                            value: pattern.id,
                                        })
                                        return acc
                                    }, [])
                                }
                            />
                        </div>
                    </>
                }
            </PanelBody>

            <PanelBody title={"Affichage"}>
                <>
                    <ToggleGroupControl
                        __nextHasNoMarginBottom
                        isBlock
                        value={data.displayMode ?? 'column'}
                        onChange={(val) => setData({'displayMode': val})}
                    >
                        <ToggleGroupControlOption
                            label={t("Column")}
                            value="column"
                        />
                        <ToggleGroupControlOption
                            label={t("Grid")}
                            value="grid"
                        />
                    </ToggleGroupControl>

                    {
                        data.displayMode === "grid" &&
                        <RangeControl
                            {...props}
                            value={data.columnSize}
                            label={__('Number of columns','mailerpress')}
                            min={2}
                            max={4}
                            onChange={val => setData({'columnSize': parseInt(val)})}
                        />
                    }
                </>
            </PanelBody>

        </>

    )
}

registerBlockType({
    custom: true,
    type:
    blockType.QUERY,
    description:
        t(`
           An advanced block that allows displaying post types based on different query parameters or manual selection and visual configurations.
        `),
    icon: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M18.1823 11.6392C18.1823 13.0804 17.0139 14.2487 15.5727 14.2487C14.3579 14.2487 13.335 13.4179 13.0453 12.2922L13.0377 12.2625L13.0278 12.2335L12.3985 10.377L12.3942 10.3785C11.8571 8.64997 10.246 7.39405 8.33961 7.39405C5.99509 7.39405 4.09448 9.29465 4.09448 11.6392C4.09448 13.9837 5.99509 15.8843 8.33961 15.8843C8.88499 15.8843 9.40822 15.781 9.88943 15.5923L9.29212 14.0697C8.99812 14.185 8.67729 14.2487 8.33961 14.2487C6.89838 14.2487 5.73003 13.0804 5.73003 11.6392C5.73003 10.1979 6.89838 9.02959 8.33961 9.02959C9.55444 9.02959 10.5773 9.86046 10.867 10.9862L10.8772 10.9836L11.4695 12.7311C11.9515 14.546 13.6048 15.8843 15.5727 15.8843C17.9172 15.8843 19.8178 13.9837 19.8178 11.6392C19.8178 9.29465 17.9172 7.39404 15.5727 7.39404C15.0287 7.39404 14.5066 7.4968 14.0264 7.6847L14.6223 9.20781C14.9158 9.093 15.2358 9.02959 15.5727 9.02959C17.0139 9.02959 18.1823 10.1979 18.1823 11.6392Z"></path></svg>`,
    edit: Edit,
    preview,
    disabledBlockType: [],
    name: "Query",
    init: (payload) => {
        const defaultData = {
            'type': blockType.QUERY,
            'data': {
                'selection': 'auto',
                'displayMode': 'column',
                'columnSize': 2,
                'pattern': 'query-pattern-default',
                'query': {
                    'postType': 'posts',
                    'per_page': 5,
                    'order': 'date/desc',
                },
                'posts': []
            },
            attributes: {},
            children: [],
        }
        return merge(defaultData, payload)
    }
})