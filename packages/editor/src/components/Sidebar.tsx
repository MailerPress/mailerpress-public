import {
    createSlotFill,
    Panel,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    __experimentalText as Text,
    Button,
} from '@wordpress/components'
import {useSelect, useDispatch} from "@wordpress/data";
import React, {useCallback, useMemo} from 'react';
import BlockManager from "../core/BlockManager.ts";
import {blockType, STORE_KEY} from "../constants.ts";
import {
    findParent,
    updateAttributesByClientId,
    updateDataAndAttributes,
    updateDataByClientId
} from "../utils/block.ts";
import TabBar from "../UI/TabBar.tsx";
import {levelUp} from "@wordpress/icons";
import {__} from "@wordpress/i18n";
import {useTheme} from "../context/Theme.tsx";

const {Slot, Fill} = createSlotFill(
    'sidebar'
)

const Sidebar = () => {
    const {editBlock} = useDispatch(STORE_KEY)
    const {theme, toggleTheme} = useTheme();

    const {data, emailConfig} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            editMode: select(STORE_KEY).getEditMode(),
            emailConfig: select(STORE_KEY).getEmailConfig(),

        }
    }, [])

    const setAttributes = (attrs) => {
        if (data) {
            editBlock(
                updateAttributesByClientId(
                    data,
                    [data].find(b => b.type === blockType.PAGE).clientId,
                    attrs
                )
            )
        }

    }
    const setData = (attrs) => {
        if (data) {
            editBlock(
                updateDataByClientId(
                    data,
                    [data].find(b => b.type === blockType.PAGE).clientId,
                    attrs
                )
            )
        }

    }
    const setDataAndAttributes = (update) => {
        editBlock(
            updateDataAndAttributes(
                data,
                [data].find(b => b.type === blockType.PAGE).clientId,
                update
            )
        )
    }

    const onEditTheme = (theme) => {
        if (theme === 'Default') {
            toggleTheme('Core')
        } else {
            toggleTheme(theme)
        }
    }

    const edit = useMemo(() => {
        const blockType = BlockManager.getBlockByType('page')
        return (
            <blockType.edit
                block={data ? [data].find(b => b.type === 'page') : null}
                setAttributes={setAttributes}
                setData={setData}
                setTheme={toggleTheme}
                theme={theme}
                onEditTheme={onEditTheme}
            />
        )
    }, [data]);

    const canEdit = useMemo(() => {
        return emailConfig && (emailConfig.status === "draft")
    }, [emailConfig]);

    return (
        canEdit &&
        <>
            <Panel>
                <TabBar
                    indexState="settings"
                    activeTab={0}
                    tabs={[
                        {
                            name: 'document',
                            title: __('Styles', 'mailerpress'),
                            className: 'tab-document',
                            content: edit
                        },
                        {
                            name: 'block',
                            title: __('Block', 'mailerpress'),
                            className: 'tab-block',
                            content: <MyCustomComponent/>
                        },
                    ]}
                />
            </Panel>
        </>
    )
}


const MyCustomComponent = () => {

    const {
        selectBlock,
    } = useDispatch(STORE_KEY)


    const {selectedBlock, data} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
        }
    }, [])

    const block = useCallback(() => {
        if (selectedBlock && selectedBlock.block) {
            if (selectedBlock.block.type === 'pattern') {
                return BlockManager.getPatternById(selectedBlock.block.id)
            } else if (selectedBlock.block.type === blockType.QUERY_PATTERN) {
                return BlockManager.getQueryPatternById(selectedBlock.block.id)
            }

            return BlockManager.getBlockByType(selectedBlock.block.type)
        }

        return null
    }, [selectedBlock])

    const selectParent = () => {
        const parent = findParent(data, selectedBlock.block.clientId)
        if (parent) {
            selectBlock(parent.clientId)
        }
    }

    return <>
        {selectedBlock && selectedBlock.block &&
            <HStack style={{padding: '12px 8px'}} expanded={true} alignment={"topLeft"} spacing={3}
                    justify="flex-start">
                {block()!.icon &&
                    <div
                        style={{minWidth: 'inherit'}}
                        className="block-editor-block-icon has-colors"
                        dangerouslySetInnerHTML={{__html: block()!.icon}}
                    />
                }
                {block()!.type === blockType.QUERY_PATTERN &&
                    <Button onClick={selectParent} icon={levelUp} label="got to query block"/>
                }
                <VStack style={{paddingRight: 12}}>
                    <Text weight="600">{block()!.name}</Text>
                    <Text weight="400">{block()!.description}</Text>
                </VStack>
            </HStack>
        }
        <Slot bubblesVirtually/>
    </>;
}

Sidebar.Fill = Fill

export default Sidebar
