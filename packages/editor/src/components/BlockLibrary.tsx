import {
    createSlotFill,
    Panel,
    Button,
    SearchControl,
    Draggable,
    __experimentalItemGroup as ItemGroup,
    __experimentalItem as Item,
    __experimentalGrid as Grid,
    __experimentalText as Text
} from '@wordpress/components'
import {useSelect, useDispatch, select} from "@wordpress/data";
import {STORE_KEY, blockType as blockTypeEnum, layout} from "../constants.ts";
import {blockType} from "../core/regisetBlockType.ts";
import slugify from "slugify";
import {
    addChildToParent,
    addNewChild, contentBlocks,
    generateBlockContent, generateBlockPattern,
    getPathToRoot
} from '../utils/block.ts';
import BlockManager, {TQueryPattern} from "../core/BlockManager.ts";
import {v4 as uuidv4} from 'uuid';
import Tree from "../UI/tree/Tree.tsx";
import {MjmlToJson} from "../utils/MjmlToJson.ts";
import mjml2html from "mjml-browser";
import {JsonToMjml} from "../utils/JsonToMjml.ts";
import decode from "unescape"
import {groupBy} from 'lodash';
import BlockPatternInserter from "./BlockPatternInserter.tsx";
import {useCallback, useEffect, useMemo, useState} from "react";
import TabBar from "../UI/TabBar.tsx";
import {__} from "@wordpress/i18n";

const {Slot, Fill} = createSlotFill(
    'block-library'
)

const BlockLibrary = () => {
    const blocks = BlockManager.getBlocks()

    const [searchBlock, setSearchBlock] = useState('')

    const {tabs, emailConfig, editMode, patterns} = useSelect(select => {
        return {
            emailConfig: select(STORE_KEY).getEmailConfig(),
            tabs: select(STORE_KEY).getTabs(),
            editMode: select(STORE_KEY).getEditMode(),
            patterns: select(STORE_KEY).patterns()
        }
    }, [])


    const blockList = useCallback((e) => {
        if (searchBlock !== '') {
            return blocks.filter(f => f.name.toLowerCase().startsWith(searchBlock.toLowerCase()))
        }

        return blocks

    }, [searchBlock, blocks])

    const canEdit = useMemo(() => {
        return emailConfig && (emailConfig.status === "draft")
    }, [emailConfig]);

    return (
        canEdit &&
        <>
            <div style={{paddingTop: 8, paddingLeft: 8, paddingRight: 8, paddingBottom: 0}}>
                <SearchControl
                    value={searchBlock}
                    onChange={setSearchBlock}
                />
            </div>
            <Panel>
                <TabBar
                    indexState={"blocks"}
                    isExpanded={true}
                    tabs={[
                        {
                            name: 'document',
                            title: 'Blocks',
                            className: 'tab-document',
                            content: <BlockList blocks={blockList()}/>
                        },
                        {
                            name: 'patterns',
                            title: 'Patterns',
                            className: 'tab-patterns',
                            content: <PatternsList patterns={
                                patterns.filter(p => p.internal === false)
                            }/>
                        },
                        {
                            name: 'block',
                            title: 'Layer',
                            className: 'tab-block',
                            content: <LayerComponent editMode={editMode}/>
                        },
                    ]}
                    activeTab={tabs.blocks}
                />
            </Panel>
        </>
    );
};

export const PatternsList = ({patterns}) => {
    const [patternList, setPatternList] = useState(null)
    const {patternsCategories} = useSelect(select => {
        return {
            patternsCategories: select(STORE_KEY).getPatternsCategories(),
        }
    }, [])

    const renderCategoryLabel = (key) => {
        if (patternsCategories && patternsCategories[key]) {
            return patternsCategories[key].label
        }

        return ''
    }

    const showPatterns = (category) => {
        if (category === 'all') {
            setPatternList(() => {
                return {label: 'All', patterns}
            })
        } else {
            const group = groupBy(patterns, "category")
            setPatternList(() => {
                return {label: patternsCategories[category].label, patterns: group[category]}
            })
        }
    }

    useEffect(() => {
        if (patternList) {
            const width = document.querySelector('#VisualEditorEditMode + div') ? 900 : 600
            document.getElementById('VisualEditorEditMode').style.maxWidth = `calc(100vw - ${width}px)`
            document.getElementById('VisualEditorEditMode').style.marginLeft = `auto`
        } else {
            document.getElementById('VisualEditorEditMode').style.maxWidth = `initial`
            document.getElementById('VisualEditorEditMode').style.marginLeft = `initial`
        }
    }, [patternList]);

    useEffect(() => {
        if (patternList && patternList.label) {
            if (patternList.label === 'all') {
                setPatternList(() => {
                    return {label: 'All', patterns}
                })
            } else {
                const group = groupBy(patterns, "category")
                setPatternList(() => {
                    return {label: patternList.label, patterns: group[patternList.patterns[0].category]}
                })
            }
        }
    }, [patterns]);

    return (
        <div style={{position: "relative"}}>
            {patternList && <BlockPatternInserter list={patternList} onClose={() => setPatternList(null)}/>}
            <ItemGroup>
                <Item size={"large"} onClick={() => showPatterns('all')}>
                    All
                </Item>
                {
                    Object.keys(groupBy(patterns, "category")).map(category =>
                        <Item size={"large"} onClick={() => showPatterns(category)}>
                            {renderCategoryLabel(category)}
                        </Item>
                    )
                }
            </ItemGroup>
        </div>
    )
}

const BlockList = ({blocks}) => {
    const {addBlock, setTabs, setHoverBlockId, setBlockDragged, selectBlock} = useDispatch(STORE_KEY)

    const {selectedBlock, blockHover, data, getBlockDragged} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
            blockHover: select(STORE_KEY).getHoveredBlockId(),
            getBlockDragged: select(STORE_KEY).getBlockDragged(),
        }
    }, [])
    const fontsMapping = useSelect((select) => select(STORE_KEY).getFonts(), []);

    const type = BlockManager.getBlockByType((selectedBlock && selectedBlock.block) ? selectedBlock.block.type : "page")

    const onInsert = (block: blockType) => {

    };

    const previewBlock = (block) => {
        if (block.type === 'pattern') {
            if ("" !== block.template()) {
                const html = mjml2html(
                    JsonToMjml(
                        BlockManager.getBlockByType(blockTypeEnum.PAGE).init({
                            children: [{...MjmlToJson(block.template())}]
                        })
                    )
                ).html

                document.querySelector('.preview-block').style.visibility = 'visible'
                document.querySelector('.preview-block').innerHTML = html
            } else {
                const html = mjml2html(
                    JsonToMjml(
                        BlockManager.getBlockByType(blockTypeEnum.PAGE).init({
                            children: [
                                {
                                    ...MjmlToJson(decode(wp.element.renderToString(block.preview(block.init({})))))
                                }
                            ]
                        })
                    )
                ).html

                document.querySelector('.preview-block').style.visibility = 'visible'
                document.querySelector('.preview-block').innerHTML = html
            }

        } else {
            if (block.disabledBlockType.length === 0) {
                const html = mjml2html(
                    JsonToMjml(
                        BlockManager.getBlockByType(blockTypeEnum.PAGE).init({
                            children: [{
                                ...block.init({
                                    preview: true
                                })
                            }]
                        })
                    )
                ).html

                document.querySelector('.preview-block').style.visibility = 'visible'
                document.querySelector('.preview-block').innerHTML = html
            }

        }

    }

    const resetPreview = () => {
        document.querySelector('.preview-block').style.visibility = 'hidden'
        document.querySelector('.preview-block').innerHTML = ''
    }

    const onDropBlock = (e) => {
        const blockType = e.target.getAttribute('data-type')
        const blockHover = select(STORE_KEY).getHoveredBlockId()
        if (blockHover === null) {
            return
        }

        const pathRoot = getPathToRoot(data, blockHover.selectedClientId)

        if (getBlockDragged.custom) {
            const clientId = uuidv4()
            const defaultPattern: TQueryPattern = BlockManager.getQueryPatternById('query-pattern-default')
            const updatedData = addNewChild(
                data,
                blockHover.selectedClientId,
                getBlockDragged.init({
                    data: {
                        inWrapper: !!pathRoot.find(p => p.type === blockTypeEnum.WRAPPER) && pathRoot.length > 1
                    },
                    children: [
                        generateBlockPattern(
                            defaultPattern.init({
                                type: 'query-pattern',
                                id: defaultPattern.id,
                                children: [],
                                clientId: uuidv4(),
                            }),
                        ),
                    ],
                    clientId
                }),
                blockHover.direction
            )

            addBlock(updatedData)
            setHoverBlockId(null)
            selectBlock(clientId)
            return
        }

        if (getBlockDragged.type === 'layout') {
            const column = BlockManager.getBlockByType(blockTypeEnum.COLUMN).init({})

            const generated = addNewChild(
                data,
                blockHover.selectedClientId,
                BlockManager.getBlockByType(blockTypeEnum.SECTION).init({
                    clientId: uuidv4(),
                    children: Array.from(getBlockDragged.layout, (width) => {
                        return {
                            ...column,
                            clientId: uuidv4(),
                            attributes: {
                                width,
                                'vertical-align': 'middle'
                            },
                        }
                    })
                }),
                blockHover.direction
            )

            addBlock(generated)
            setHoverBlockId(null)
            return;
        }

        if (blockHover && blockHover.direction !== 'inside' && pathRoot.length > 0) {
            if (pathRoot[pathRoot.length - 1].type === blockTypeEnum.WRAPPER && blockHover.type === blockTypeEnum.SECTION) {
                const updatedData = addNewChild(
                    data,
                    blockHover.selectedClientId,
                    generateBlockContent(
                        BlockManager.getBlockByType(blockType).init({
                            clientId: uuidv4()
                        }),
                        pathRoot[pathRoot.length - 1].type
                    ),
                    blockHover.direction
                )
                addBlock(updatedData)

            } else {
                let parent = 'page';

                if (
                    pathRoot.find(p => p.type === blockTypeEnum.WRAPPER)
                    && !contentBlocks.includes(blockHover.type)
                ) {
                    parent = pathRoot.find(p => p.type === blockTypeEnum.WRAPPER).type
                }

                if (pathRoot.length > 1) {
                    parent = ''
                }

                const updatedData = addNewChild(
                    data,
                    blockHover.selectedClientId,
                    generateBlockContent(
                        BlockManager.getBlockByType(blockType).init({
                            clientId: uuidv4(),
                            data: {
                                fonts: fontsMapping
                            }
                        }),
                        parent
                    ),
                    blockHover.direction
                )
                addBlock(updatedData)

            }


        } else {
            const updatedData = addChildToParent(
                data,
                blockHover.selectedClientId,
                BlockManager.getBlockByType(blockType).init({
                    clientId: uuidv4()
                }),
            )

            addBlock(updatedData)
        }


        setHoverBlockId(null)
    }

    const onDragStart = (event) => {
        selectBlock(null)
        document.querySelector('.preview-block').style.visibility = 'hidden'
        document.querySelector('.preview-block').innerHTML = ''
        const originalNode = event.target;
        const blockType = originalNode.getAttribute('data-type');
        const id = originalNode.getAttribute('id');
        let blockDragged = null;

        if (blockType === 'pattern' || blockType === blockTypeEnum.QUERY_PATTERN) {
            blockDragged = BlockManager.getPatternById(id);
        } else {
            blockDragged = BlockManager.getBlockByType(blockType);
        }

        setBlockDragged(blockDragged);

        const clonedNode = document.createElement('div');
        clonedNode.insertAdjacentHTML('afterbegin', `
        <div style="display:flex; align-items: center; gap: 4px">
            <span style="fill: white; display: flex;">${blockDragged.icon}</span>
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing:1.1">${blockDragged.name}</span>
        </div>
    `);
        clonedNode.style.position = 'absolute';
        clonedNode.style.pointerEvents = 'none';
        clonedNode.style.background = '#000';
        clonedNode.style.color = 'white';
        clonedNode.style.zIndex = '999999';
        clonedNode.style.padding = '8px 8px 8px 20px';
        clonedNode.style.borderRadius = '6px';
        clonedNode.style.boxShadow = '0px 10px 15px -3px rgba(0,0,0,0.1)';

        document.body.appendChild(clonedNode);

        const transparentDragImage = document.createElement('div');
        transparentDragImage.style.width = '1px';
        transparentDragImage.style.height = '1px';
        transparentDragImage.style.opacity = '0';
        document.body.appendChild(transparentDragImage);

        event.dataTransfer.setDragImage(transparentDragImage, 0, 0);

        // Position initiale du clone (dès le début du drag)
        clonedNode.style.left = `${event.pageX}px`;
        clonedNode.style.top = `${event.pageY}px`;

        // Suivre le mouvement de la souris
        document.addEventListener('dragover', (dragEvent) => {
            clonedNode.style.left = `${dragEvent.pageX}px`;
            clonedNode.style.top = `${dragEvent.pageY}px`;
        });


        originalNode.addEventListener('dragend', () => {
            clonedNode.remove();
            selectBlock(null);
            document.removeEventListener('dragover', null);
        });
    };

    return (
        <div id="draggable-panel">
            <Text variant={"muted"} style={{padding: 16}} weight="600" upperCase={true} size={11}
                  isBlock={true}>Blocks</Text>
            <Grid columns={3}>
                {
                    blocks
                        .filter((b: blockType) => (b.internal === false || undefined === b.internal)).map(
                        (b, index) =>
                            <div className="block-item" onMouseEnter={() => previewBlock(b)}
                                 onMouseLeave={() => resetPreview()}>
                                <Draggable
                                    key={`drag-item-${index}`}
                                    elementId={`drag-item-${b.type}`}
                                    appendToOwnerDocument={false}
                                    transferData={{}}
                                    onDragEnd={(e) => onDropBlock(e)}
                                >
                                    {({onDraggableEnd}) => (
                                        <Button
                                            data-type={`${b.type}`}
                                            id={`${b.id}`}
                                            draggable
                                            onDragEnd={onDraggableEnd}
                                            onDragStart={(e) => onDragStart(e)}
                                            // onDragStart={(e) => {
                                            //     if (selectedBlock && selectedBlock.block) {
                                            //         selectBlock(null)
                                            //     }
                                            //
                                            //     const blockType = e.target.getAttribute('data-type').replace('draggable-block-', '')
                                            //     document.querySelector('.preview-block').style.visibility = 'hidden'
                                            //     document.querySelector('.preview-block').innerHTML = ''
                                            //     if (blockType === 'pattern') {
                                            //         setBlockDragged(
                                            //             BlockManager.getPatternById(e.target.getAttribute('id'))
                                            //         )
                                            //     } else {
                                            //         setBlockDragged(
                                            //             BlockManager.getBlockByType(blockType)
                                            //         )
                                            //     }
                                            //
                                            // }}
                                            className="block-item__button"
                                            key={slugify(b.name)}
                                            onClick={() => onInsert!(b)}
                                            variant="tertiary"
                                        >
                                            {
                                                b.icon &&
                                                <div
                                                    style={{width: '50%', marginBottom: 6}}
                                                    dangerouslySetInnerHTML={{__html: b.icon}}
                                                />
                                            }
                                            {b.name}
                                        </Button>
                                    )}
                                </Draggable>
                            </div>
                    )
                }
            </Grid>
            <Text variant={"muted"} style={{padding: 16}} weight="600" upperCase={true} size={11}
                  isBlock={true}>Layout</Text>
            <Grid columns={3}>
                {
                    layout.map(
                        (b, index) =>
                            <div className="block-item">
                                <Draggable
                                    key={`drag-item-${index}`}
                                    appendToOwnerDocument={true}
                                    transferData={{}}
                                    onDragEnd={(e) => onDropBlock(e)}
                                >
                                    {({onDraggableEnd}) => (
                                        <Button
                                            data-type={`draggable-block-layout`}
                                            draggable
                                            onDragEnd={onDraggableEnd}
                                            className="block-item__button"
                                            key={index}
                                            onDragStart={() => {
                                                setBlockDragged({
                                                    ...b,
                                                    type: "layout"
                                                })
                                            }}
                                            variant="tertiary"
                                        >
                                            <span dangerouslySetInnerHTML={{__html: b.icon}}/>
                                            {b.label}
                                        </Button>
                                    )}
                                </Draggable>
                            </div>
                    )
                }
            </Grid>
        </div>
    )
}

const LayerComponent = ({editMode}) => {
    const {data} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
        }
    }, [])

    return (
        editMode === 'builder' ?
            <Tree data={data}/> :
            <Text align={"center"} isBlock={true} style={{padding: 12}}>
                {__('Layer is not available on live mode','mailerpress')}
            </Text>

    )
}

BlockLibrary.Fill = Fill

export default BlockLibrary
