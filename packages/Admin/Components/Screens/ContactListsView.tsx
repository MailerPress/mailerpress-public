import React, {useMemo, useState} from "react"
import ComponentWrapper from "../ComponentWrapper.tsx";
import {useModalContext} from "../../context/ModalContext.tsx";
import useDataRecords from "../../../hooks/useDataRecords.ts";
import {
    __experimentalHStack as HStack,
    __experimentalSpacer as Spacer,
    __experimentalInputControl as InputControl,
    Button,
    Spinner
} from "@wordpress/components";
import DataView from "../../../components/DataView/index.tsx";
import {t} from "../../../editor/src/utils/function.ts";
import Tag from "../../../components/Tag.tsx";
import EmptyState from "../../../components/EmptyState.tsx";
import {ApiService} from "../../../editor/src/core/apiService.ts";
import {create} from "@wordpress/icons";


const intitalFilters = {
    perPages: '20',
    listing: true,
    paged: 1,
    search: '',
    orderby: 'name',
    order: 'DESC',
}


const ContactListsView = () => {
    const [filters, setFilters] = useState(intitalFilters)
    const [popover, setPopover] = useState('')
    const {setModal,} = useModalContext()
    const {records, isLoading, onReload} = useDataRecords('list', filters);

    const togglePopover = id => {
        if (popover === id) {
            setPopover('')
        } else {
            setPopover(id)
        }
    }

    const FormCreateList = () => {
        const [value, setValue] = useState()

        const createList = () => {
            ApiService.createNewList(value).then(() => {
                setModal(null)
                onReload()
            })
        }

        return (
            <div
                style={{width: '100%'}}
            >
                <InputControl
                    label={t('Name')}
                    value={value}
                    onChange={(nextValue) => setValue(nextValue ?? '')}
                />
                <Spacer/>
                <Button onClick={createList} variant={"primary"}>{t('Save')}</Button>
            </div>
        )
    }

    const filterHasChanged = useMemo(() => {
        return JSON.stringify(filters) !== JSON.stringify(intitalFilters)
    }, [filters]);
    return (
        <ComponentWrapper desc={"Organized your email contacts into list."} mainTitle={"Contacts List"} actions={[
            <Button
                icon={create}
                onClick={() =>
                    setModal({
                        className: "modal-full-h",
                        title: t('Add a list'),
                        size: 'medium',
                        component: <FormCreateList/>
                    })
                }
                variant={"primary"}
            >{t('Add a list')}</Button>
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
                        ]}
                        renderEmptyState={() => <EmptyState
                            resetAll={() => setFilters(intitalFilters)}
                            label={t('No list found')}
                            description={t('It looks like your list is empty.')}
                        />}
                        onReset={() => setFilters(intitalFilters)}
                        filtersHasChanged={filterHasChanged}
                    />
                }
            </>
        </ComponentWrapper>
    )
}
export default ContactListsView