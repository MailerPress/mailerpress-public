import React from "react"
import {Button, Dropdown, Icon, SearchControl, __experimentalGrid as Grid, __experimentalText as Text, ToolbarButton} from '@wordpress/components';
import {plus, paragraph, addCard} from '@wordpress/icons';
import slugify from "slugify";
import BlockManager from "../core/BlockManager.ts";
import Block from "../interfaces/block.ts";
import {blockType} from "../constants.ts";

type blockInserterProps = {
    onInsert?: Function,
    selectedBlock: object
}

const  BlockInserter = ({onInsert, selectedBlock}: blockInserterProps) => {
    const type = BlockManager.getBlockByType(selectedBlock.block.type)
    const blocks = BlockManager.getBlocks().filter(b => !type.disabledBlockType.includes(b.type));

    return (
        <div className="inserter-container">
            <Dropdown
                className="inserter-container__dropdown"
                contentClassName="is-unstyled block-library"
                popoverProps={{placement: 'bottom-start'}}
                renderToggle={({isOpen, onToggle}) => (
                    <ToolbarButton onClick={onToggle}>
                        Add block
                    </ToolbarButton>
                )}
                renderContent={() => <div className="inserter-container__content">
                    <SearchControl
                        help="Help text to explain the input."
                        onChange={function noRefCheck() {
                        }}
                    />
                    <Grid columns={3}>
                        {
                            blocks.filter((b: blockType) => (b.internal === false || undefined === b.internal)).map(
                                block =>
                                    <div className="block-item">
                                        <Button
                                            className="block-item__button"
                                            key={slugify(block.name)}
                                            onClick={() => onInsert!(block)}
                                            variant="tertiary"
                                        >
                                            {
                                                block.icon &&
                                                <div
                                                    style={{width: '50%', marginBottom: 6}}
                                                    dangerouslySetInnerHTML={{__html: block.icon}}
                                                />
                                            }
                                            {block.name}
                                        </Button>
                                    </div>
                            )
                        }
                    </Grid>
                </div>
                }
            />
        </div>
    )
}

export default BlockInserter