import React, {useEffect, useState} from "react"
import {
    __experimentalHeading as Heading,
    Button,
    Draggable,
    __experimentalText as Text,
    __experimentalHStack as HStask,
    __experimentalConfirmDialog as ConfirmDialog
} from '@wordpress/components'
import {closeSmall, cloud, Icon, trash} from "@wordpress/icons";
import mjml2html from "mjml-browser";
import {JsonToMjml} from "../utils/JsonToMjml.ts";
import BlockManager from "../core/BlockManager.ts";
import {blockType as blockTypeEnum, STORE_KEY} from "../constants.ts";
import {MjmlToJson} from "../utils/MjmlToJson.ts";
import {useDispatch, useSelect} from "@wordpress/data";
import {addNewChild, generateBlockPattern} from "../utils/block.ts";
import {addClientIdImmutableWithUnique, t} from "../utils/function.ts";
import {v4 as uuidv4} from 'uuid';
import {ApiService} from "../core/apiService.ts";
import {useToasts} from "../hooks/useToasts.ts";
import {__} from "@wordpress/i18n";

const BlockPatternItem = ({pattern, onClose}) => {
    const {pushToast} = useToasts();
    const [html, setHtml] = useState('')
    const {addBlock, selectBlock, setHoverBlockId, setBlockDragged, deletePattern} = useDispatch(STORE_KEY)
    const {selectedBlock, blockHover, data} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
            blockHover: select(STORE_KEY).getHoveredBlockId(),
        }
    }, [])
    const [confirmDeletePattern, setConfirmDeletePattern] = useState(false);

    useEffect(() => {
        if ("" !== pattern.template()) {
            const html = mjml2html(
                JsonToMjml(
                    BlockManager.getBlockByType(blockTypeEnum.PAGE).init({
                        children: [{...MjmlToJson(pattern.template())}]
                    }),
                )
            ).html

            setHtml(html)

        } else if (undefined !== pattern.json) {
            const html = mjml2html(
                JsonToMjml(
                    BlockManager.getBlockByType(blockTypeEnum.PAGE).init({
                        children: [
                            pattern.json
                        ]
                    })
                )
            ).html
            setHtml(html)
        } else {
            const html = mjml2html(
                JsonToMjml(
                    pattern.compiled
                )
            ).html

            setHtml(html)
        }
    }, [pattern]);

    const onDropPattern = e => {
        const element = e.target.closest("[data-type=\"draggable-block-pattern\"]")
        if (element === undefined) {
            return;
        }

        const id = element.getAttribute('id')

        if (blockHover === null) {
            return
        }

        const block = BlockManager.getPatternById(id)

        if (block === undefined) {
            return;
        }

        if (block.json !== undefined) {
            const updatedData = addNewChild(
                data,
                blockHover.selectedClientId,
                addClientIdImmutableWithUnique(block.json),
                blockHover.direction
            )
            addBlock(updatedData)
        } else {
            const updatedData = addNewChild(
                data,
                blockHover.selectedClientId,
                generateBlockPattern(
                    block.init({
                        id: block.id,
                        type: 'pattern',
                        children: [],
                        clientId: uuidv4()
                    }),
                ),
                blockHover.direction
            )


            addBlock(updatedData)
        }

        setHoverBlockId(null)
        onClose()
    }

    const onDeletePattern = id => {
        ApiService.deletePattern(id)
            .then(() => {
                pushToast({
                    title: __('Pattern deleted successfully', 'mailerpress'),
                    status: 'success',
                    duration: 5
                })
                deletePattern(id)
            })
            .catch(() => {
                pushToast({
                    title: __('Error while deleting pattern', 'mailerpress'),
                    status: 'success',
                    duration: 5
                })
            })
    }

    const handleConfirm = () => {
        handleCancel()
        onDeletePattern(pattern.postId)
    };

    const handleCancel = () => {
        setConfirmDeletePattern(false);
    };

    return (
        <>
            <ConfirmDialog
                isOpen={confirmDeletePattern}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            >
                {__('Are you sure you want to delete this pattern? This action is irreversible.', 'mailerpress')}
            </ConfirmDialog>
            <Draggable
                key={`drag-item-${pattern.id}`}
                elementId={`drag-item-${pattern.type}`}
                appendToOwnerDocument={false}
                transferData={{}}
                onDragEnd={(e) => onDropPattern(e)}
            >
                {({onDraggableEnd}) => (
                    <>
                        <div
                            id={`${pattern.id}`}
                            data-type={`draggable-block-${pattern.type}`}
                            onDragStart={(e) => {
                                if (selectedBlock && selectedBlock.block) {
                                    selectBlock(null)
                                }
                                setBlockDragged(
                                    BlockManager.getPatternById(e.target.closest("[data-type=\"draggable-block-pattern\"]").getAttribute('id'))
                                )
                            }}
                            onDragEnd={onDraggableEnd}
                            draggable
                            dangerouslySetInnerHTML={{__html: html}}
                        />
                        <HStask>
                            <Text>
                                {pattern.name}
                            </Text>
                            <div>
                                {pattern.database && <HStask>
                                    <Button
                                        onClick={() => setConfirmDeletePattern(true)}
                                        icon={trash} isDestructive
                                    />
                                    <Icon icon={cloud}/>
                                </HStask>
                                }
                            </div>
                        </HStask>
                    </>
                )}
            </Draggable>
        </>
    )
}
const BlockPatternInserter = ({list, onClose}) => {
    useEffect(() => {
        if (list && (list.patterns === undefined || list.patterns === null)) {
            onClose()
        }
    }, [list]);

    return (
        <div className="block-pattern-inserter">
            <div>
                <header style={{marginBottom: 16}}>
                    <Heading level={3}>
                        {list.label}
                    </Heading>
                    <Button onClick={onClose} icon={closeSmall}/>
                </header>
                <div className="block-pattern-inserter__list">
                    {list.patterns && list.patterns.map(
                        pattern =>
                            <BlockPatternItem
                                onClose={onClose}
                                key={pattern.id}
                                pattern={pattern}
                            />
                    )}
                </div>
            </div>
        </div>
    )
}
export default BlockPatternInserter