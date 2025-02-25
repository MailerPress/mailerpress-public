import React, {useCallback, useEffect, useState} from 'react'
import {debounce} from 'lodash';
import {FormTokenField} from "@wordpress/components";
import {ApiService} from "../../core/apiService.ts";
import {__} from "@wordpress/i18n";

export function SearchControl(props) {
    const {block, setData, onChange, value} = props

    const [suggestions, setSuggestions] = useState([])
    const [values, setValues] = useState(value || [])

    const verify = useCallback(
        debounce((value) => {
            ApiService.searchPost({search: value}).then(results => setSuggestions(results))
        }, 350),
        []
    );

    useEffect(() => {
        onChange(values)
    }, [values, suggestions]);

    return (
        <div style={{marginTop: 16}}>
            <FormTokenField
                __experimentalRenderItem={({item}) => {

                    const find = suggestions.find(s => s.title.rendered === item);

                    return (
                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <img width={"20px"} height={"20px"} src={"https://placehold.co/50x50"}/>
                            <span style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: 'center',
                                flex: 1
                            }}>
                                <span style={{paddingRight: 16}}>{item}</span>
                                <span style={{textTransform: 'capitalize'}}>{find.subtype}</span>
                            </span>
                        </div>
                    )
                }}
                __nextHasNoMarginBottom
                label={__('Search a post','mailerpress')}
                onChange={(val) => {
                    if (val.length < values.length) {
                        setValues(
                            values.filter(s => val.includes(s.title.rendered))
                        )
                    } else {
                        setValues([
                            ...values,
                            suggestions.find(post => val.includes(post.title.rendered))
                        ])
                    }
                }}
                onInputChange={verify}
                suggestions={
                    suggestions.reduce((acc, cur) => {
                        acc.push(cur.title.rendered)
                        return acc
                    }, [])
                }
                value={
                    values.reduce((acc, cur) => {
                        acc.push(cur.title.rendered)
                        return acc
                    }, [])
                }
            />
        </div>
    )
}