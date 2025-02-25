import {useCallback, useEffect, useState} from "react";
import {useSelect} from "@wordpress/data";
import {STORE_KEY} from "../constants.ts";

export default function useBlockParams(props) {

    const {previewMode} = useSelect(select => {
        return {
            previewMode: select(STORE_KEY).getPreviewMode(),
        }
    }, [])

    const {activeTab, setDataAndAttributes} = props;

    const [block, setBlock] = useState(props.block)

    const {selectedBlock} = useSelect(select => {
        return {
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
        }
    }, [])

    useEffect(() => {
        if (previewMode === 'mobile') {
            setBlock({
                ...props.block,
                attributes: {
                    ...props.block.attributes,
                    ...props.block.mobileAttributes
                },
                data: {
                    ...props.block.data,
                }
            })
        } else {
            setBlock({
                ...props.block,
                attributes: {
                    ...props.block.attributes,
                },
                data: {
                    ...props.block.data,
                }
            })
        }
    }, [previewMode, selectedBlock]);

    const edit = useCallback(val => {

        const multipleUpdate = ['attributes', 'data', 'mobileAttributes'];

        if (multipleUpdate.some(key => key in val)) {
            setDataAndAttributes({
                ...val
            })
        } else {
            if (activeTab === 'mobile') {
                setDataAndAttributes({
                    ...props.block,
                    mobileAttributes: val
                })
            } else {
                setDataAndAttributes({
                    ...props.block,
                    attributes: val
                })
            }
        }
    }, [activeTab, selectedBlock, props.block])

    return {
        block,
        edit,
        activeTab
    }
}