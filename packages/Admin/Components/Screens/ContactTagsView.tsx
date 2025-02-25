import React, {useMemo, useState} from "react"
import ComponentWrapper from "../ComponentWrapper.tsx";
import useDataRecords from "../../../hooks/useDataRecords.ts";
import DataView from "../../../components/DataView/index.tsx";
import {t} from "../../../editor/src/utils/function.ts";
import {
    __experimentalHStack as HStack,
    __experimentalText as Text, Button,
    Spinner
} from "@wordpress/components";
import EmptyState from "../../../components/EmptyState.tsx";
import Tag from "../../../components/Tag.tsx";
import {useModalContext} from "../../context/ModalContext.tsx";
import {create} from "@wordpress/icons";

const intitalFilters = {
    perPages: '20',
    listing: true,
    paged: 1,
    search: '',
    orderby: 'name',
    order: 'DESC',
}

const ContactTagsView = () => {
    const [filters, setFilters] = useState(intitalFilters)
    const [popover, setPopover] = useState('')
    const {setModal} = useModalContext()
    const {records, isLoading} = useDataRecords('tags', filters);

    const togglePopover = id => {
        if (popover === id) {
            setPopover('')
        } else {
            setPopover(id)
        }
    }

    const filterHasChanged = useMemo(() => {
        return JSON.stringify(filters) !== JSON.stringify(intitalFilters)
    }, [filters]);

    return (
        <ComponentWrapper desc={"Categorize your contacts with tags."} mainTitle={'Contacts Tags'} actions={[
            <Button
                icon={create}
                onClick={() =>
                    setModal({
                        className: "modal-full-h",
                        title: t('Add a tag'),
                        size: 'medium',
                        component: null
                    })
                }
                variant={"primary"}
            >{t('Add a tag')}</Button>,
        ]}>
            <>
                {records === null && isLoading && <HStack justify={"center"}>
                    <div style={{padding: 16}}>
                        <Spinner/>
                    </div>
                </HStack>
            }
            {records &&
                <DataView
                    sorts={[
                        {value: "name", label: "Name"},
                        {value: "tag_id", label: "ID"},
                    ]}
                    setFilters={setFilters}
                    isLoading={isLoading}
                    filters={filters}
                    onUpdateFilter={(filter, val) => {
                        setFilters({
                            ...filters,
                            [filter]: val
                        })
                    }}
                    onSearch={search => {
                        setFilters((prevState) => ({...prevState, search}))
                    }}
                    setPopover={(id) => togglePopover(id)}
                    popover={popover}
                    hasSearchBar={true}
                    data={records}
                    fields={[
                        {
                            id: 'tag_id',
                            hidden: true,
                            header: "ID",
                            render: ({item}) => {
                                return item.tag_id
                            }

                        },
                        {
                            id: 'name',
                            hidden: false,
                            header: t('Name'),
                            render: ({item}) => {
                                return <Tag withPoint type={"info"}>{item.name}</Tag>
                            }

                        },
                        {
                            id: 'contact_count',
                            hidden: false,
                            header: t('Contact number'),
                            render: ({item}) => {
                                return <Text weight="bold">{item.contact_count}</Text>
                            }

                        },
                    ]}
                    renderEmptyState={() => <EmptyState
                        resetAll={() => setFilters(intitalFilters)}
                        label={t('No tag found')}
                        description={t('It looks like your tag list is empty.')}
                    />}
                    onReset={() => setFilters(intitalFilters)}
                    filtersHasChanged={filterHasChanged}
                />
            }
            </>
        </ComponentWrapper>
    )
}
export default ContactTagsView