import React, {useMemo, useState} from "react"
import {
    __experimentalHStack as HStack,
    __experimentalText as Text,
    __experimentalVStack as VStack,
    __experimentalSpacer as Spacer,
    Button, DropZone, Modal, Spinner, __experimentalConfirmDialog as ConfirmDialog
} from "@wordpress/components";
import ComponentWrapper from "../ComponentWrapper.tsx";
import DataView from "../../../components/DataView/index.tsx";
import {download, trash, upload} from "@wordpress/icons";
import {t} from "../../../editor/src/utils/function.ts";
import EmptyState from "../../../components/EmptyState.tsx";
import useDataRecords from "../../../hooks/useDataRecords.ts";
import Tag from "../../../components/Tag.tsx";
import ContactDetails from "../Modals/ContactDetails.tsx";
import ContactImporter from "../../../components/ContactImporter.tsx";
import {useImportContext} from "../../context/ImportContactContext.tsx";
import AddContact from "../../../components/AddContact.tsx";
import {useModalContext} from "../../context/ModalContext.tsx";
import {ApiService} from "../../../editor/src/core/apiService.ts";
import {useToasts} from "../../../editor/src/hooks/useToasts.ts";
import ExportContact from "../../../components/ExportContact.tsx";

const intitalFilters = {
    perPages: '20',
    listing: true,
    paged: 1,
    subscription_status: '',
    search: '',
    orderby: 'email',
    order: 'DESC',
}

const ContactView = () => {
    const {setModal} = useModalContext();
    const [filters, setFilters] = useState(intitalFilters)
    const [popover, setPopover] = useState('')
    const {records, isLoading, onReload} = useDataRecords('contacts/all', filters);
    const {isImporting, progress} = useImportContext();
    const {pushToast} = useToasts();
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
        setIsOpen(false);
        handleBulkDelete(isOpen)
    };

    const handleCancel = () => {
        setIsOpen(false);
    };
    const filterHasChanged = useMemo(() => {
        return JSON.stringify(filters) !== JSON.stringify(intitalFilters)
    }, [filters]);
    const togglePopover = id => {
        if (popover === id) {
            setPopover('')
        } else {
            setPopover(id)
        }
    }

    const renderStatus = (item) => {

        switch (item) {
            case 'pending':
                return <Tag type="warning" withPoint={true}>
                    {t('Pending')}
                </Tag>
            case 'unsubscribed':
                return <Tag type="error" withPoint={true}>
                    {t('Unsubscribed')}
                </Tag>
            default:
                return <Tag type="success" withPoint={true}>
                    {t('Subscribed')}
                </Tag>
        }
    }

    const handleDeleteContact = data => {
        ApiService.deleteContact([data.contact_id]).then(res => {
            onReload()
            pushToast({
                title: t('Contact deleted successfully'),
                type: 'success',
                duration: 5
            })
        })
    }

    const handleBulkDelete = selection => {
        if (true === selection.isAllOccurrence) {
            ApiService.deleteAllContact().then(() => {
                onReload()
                pushToast({
                    title: t('All Contacts deleted successfully'),
                    type: 'success',
                    duration: 5
                })
            })
        } else {
            ApiService.deleteContact(selection.selected).then(res => {
                onReload()
                pushToast({
                    title: t('Contact deleted successfully'),
                    type: 'success',
                    duration: 5
                })
            })
        }
    }

    const handleBulkUpdateStatus = (status, selection) => {
        ApiService.updateContactStatus(status, selection).then(() => {
            onReload()
            pushToast({
                title: `${t('All Contacts are now')} ${status}`,
                type: 'success',
                duration: 5
            })
        })
    }

    return (
        <ComponentWrapper
            desc={"Complete list of all your email contacts."}
            mainTitle={"All Contacts"}
            actions={[<Button
                onClick={() =>
                    setModal({
                        className: "modal-full-h",
                        title: t('Add a contact'),
                        size: 'medium',
                        component: <AddContact onReload={onReload}/>
                    })
                }
                variant={"tertiary"}
            >{t('Add a contact')}
            </Button>,
                <Button
                    icon={download}
                    onClick={() =>
                        setModal({
                            hasHeader: false,
                            className: "modal-full-h no-header",
                            title: t('Export contacts'),
                            component: <ExportContact closeModal={() => setModal(null)}/>
                        })
                    }
                    variant={"secondary"}
                >{t('Export contacts')}
                </Button>,
                <Button
                    icon={upload}
                    onClick={() =>
                        setModal({
                            hasHeader: false,
                            className: "modal-full-h no-header",
                            title: t('Import contacts'),
                            component: <ContactImporter closeModal={() => setModal(null)}/>
                        })
                    }
                    variant={"primary"}
                >{t('Import contacts')}
                </Button>
            ]}
        >
            <>
                <ConfirmDialog
                    isOpen={isOpen}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                >
                    {t('Are you sure you want to delete all selected contacts, this action is irreversible?')}
                </ConfirmDialog>

                {isImporting &&
                    <VStack alignment={"end"}>
                        <HStack expanded={false} justify={"flex-start"}>
                            <span className="loader"/>
                            <Text variant={"muted"}>
                                {t('An import is currently running -')}
                            </Text>
                            <Text weight={"bold"}>
                                {progress}%
                            </Text>
                        </HStack>
                    </VStack>
                }
                <DropZone
                    onFilesDrop={files => setModal({
                        hasHeader: false,
                        className: "modal-full-h",
                        title: t('Import contacts'),
                        component: <ContactImporter file={files[0]} closeModal={() => setModal(null)}/>
                    })}
                />
                {records === null && isLoading && <HStack justify={"center"}>
                    <div style={{padding: 16}}>
                        <Spinner/>
                    </div>
                </HStack>
                }
                {records &&
                    <DataView
                        bulkActions={[
                            {
                                content: t('Delete'),
                                icon: trash,
                                isDestructive: true,
                                onAction: (selection) => setIsOpen(selection),

                            },
                            {
                                content: t('Export'),
                                icon: download,
                                onAction: (selection) => setIsOpen(selection),

                            },
                            {
                                title: 'Edit contacts',
                                actions: [
                                    {
                                        title: t('Set as subscribed'),
                                        onClick: selection => handleBulkUpdateStatus('subscribed', selection),
                                    },
                                    {
                                        title: t('Set as unsubscribed'),
                                        onClick: selection => handleBulkUpdateStatus('unsubscribed', selection),
                                    },
                                    {
                                        title: t('Set as pending'),
                                        onClick: selection => handleBulkUpdateStatus('pending', selection),
                                    },
                                ],
                            },
                        ]}
                        sorts={[
                            {value: "email", label: "Email"},
                            {value: "first_name", label: "First Name"},
                            {value: "last_name", label: "Last Name"},
                        ]}
                        setFilters={setFilters}
                        tabsFilter={[
                            {
                                active: filters.subscription_status === '',
                                label: t('All'),
                                onClick: () => setFilters((prevState) => ({
                                    ...prevState,
                                    subscription_status: '',
                                    paged: 1
                                }))
                            },
                            {
                                active: filters.subscription_status === 'subscribed',
                                label: t('Subscribed'),
                                onClick: () => setFilters((prevState) => ({
                                    ...prevState,
                                    subscription_status: 'subscribed',
                                    paged: 1
                                }))
                            },
                            {
                                active: filters.subscription_status === 'unsubscribed',
                                label: t('Unsubscribed'),
                                onClick: () => setFilters((prevState) => ({
                                    ...prevState,
                                    subscription_status: 'unsubscribed',
                                    paged: 1
                                }))
                            },
                            {
                                active: filters.subscription_status === 'pending',
                                label: t('Pending'),
                                onClick: () => setFilters((prevState) => ({
                                    ...prevState,
                                    subscription_status: 'pending',
                                    paged: 1
                                }))
                            },
                        ]}
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
                                id: 'contact_id',
                                hidden: true,
                                header: "ID",
                                render: ({item}) => {
                                    return item.contact_id
                                }

                            },
                            {
                                id: 'email',
                                hidden: false,
                                header: "Email",
                                render: ({item}) => {
                                    return <VStack>
                                        <Text
                                            onClick={() =>
                                                setModal({
                                                    className: "modal-full-h",
                                                    title: t('Contact details'),
                                                    component: <ContactDetails contact={item}/>
                                                })
                                            }
                                            weight={"bold"}
                                        >{item.email}</Text>
                                        <HStack expanded={false} justify={'flex-start'}>
                                            {item.tags.map(t => <Tag withPoint type="info">{t}</Tag>)}
                                        </HStack>
                                    </VStack>
                                }

                            },
                            {
                                id: 'contact_lists',
                                hidden: false,
                                header: "Lists",
                                render: ({item}) => {
                                    return <VStack expanded={false} alignment={"left"}>
                                        {item.contact_lists.map(list => <Tag type={"info"} withPoint={true}>
                                            {list.list_name}
                                        </Tag>)}
                                    </VStack>
                                }

                            },
                            {
                                id: 'first_name',
                                hidden: false,
                                header: "First name",
                                render: ({item}) => {
                                    return item.first_name
                                }

                            },
                            {
                                id: 'last_name',
                                hidden: false,
                                header: "Last name",
                                render: ({item}) => {
                                    return item.last_name
                                }

                            },
                            {
                                id: 'subscription_status',
                                hidden: false,
                                header: "Email marketing",
                                render: ({item}) => {
                                    return renderStatus(item.subscription_status)
                                }

                            },
                        ]}
                        renderEmptyState={() => <EmptyState
                            resetAll={() => setFilters(intitalFilters)}
                            label={t('No contact found')}
                            description={t('It looks like your contact list is empty.')}
                        />}
                        onReset={() => setFilters(intitalFilters)}
                        onPreview={item => setModal({
                            className: "modal-full-h",
                            title: t('Contact details'),
                            component: <ContactDetails contact={item}/>
                        })}
                        filtersHasChanged={filterHasChanged}
                        confirmDeleteAction={handleDeleteContact}
                    />
                }
            </>
        </ComponentWrapper>

    )
}
export default ContactView