import React, {useCallback} from 'react'
import {SelectControl} from "./SelectControl.tsx";
import {NumberControl} from "./NumberControl.tsx";
import { debounce } from 'lodash';

export function QueryControl(props) {
    const {block, setData, onChange, value} = props

    const verify = useCallback(
        debounce((value) => {
            setData({query: {...block.data.query, per_page: value}})
        }, 350),
        []
    );

    return (
        <div style={{marginTop: 16}}>
            <SelectControl
                label={"Post Type"}
                options={[
                    {label: "Post", value: "posts"},
                    {label: "Page", value: "pages"},
                ]}
                value={block.data.query.postType}
                onChange={value => setData({query: {...block.data.query, postType: value}})}
            />

            <SelectControl
                label="Order By"
                options={[
                    {label: "Newest to oldest", value: "date/desc"},
                    {label: "Oldest to newest", value: "date/asc"},
                    {label: "A → Z", value: "title/asc"},
                    {label: "Z → A", value: "title/desc"},
                ]}
                value={block.data.query.order}
                onChange={value => setData({query: {...block.data.query, order: value}})}
            />

            <SelectControl
                label="Category"
                options={window.jsVars.categories.reduce((acc, item) => {
                    acc.push({
                        label: item.name,
                        value: item.term_id
                    })
                    return acc;
                }, [])}
                value={block.data.query.category}
                onChange={value => setData({query: {...block.data.query, category: value}})}
            />

            <div style={{marginTop: 16}}>
                <NumberControl
                    label='Limit'
                    value={block.data.query.per_page}
                    min={1}
                    max={20}
                    onChange={value => verify(value)}
                />
            </div>

        </div>
    )
}