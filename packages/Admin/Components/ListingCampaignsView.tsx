import React, {useEffect, useMemo, useState} from "react"
import {
    __experimentalConfirmDialog as ConfirmDialog,
    __experimentalGrid as Grid,
    __experimentalHStack as HStack,
    __experimentalText as Text,
    __experimentalVStack as VStack, Button, Spinner, Notice
} from "@wordpress/components";
import {
    scheduled,
    trash,
    plus, published, drafts, error, pending, caution
} from "@wordpress/icons";
import {__} from "@wordpress/i18n";
import ComponentWrapper from "./ComponentWrapper.tsx";
import DataView from "../../components/DataView/index.tsx";
import EmptyState from "../../components/EmptyState.tsx";
import dayjs from "dayjs";
import {ApiService} from "../../editor/src/core/apiService.ts";
import Tag from "../../components/Tag.tsx";
import useDataRecords from "../../hooks/useDataRecords.ts";
import FrameView from "../../components/FrameView.tsx";
import {useToasts} from "../../editor/src/hooks/useToasts.ts";
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const initialFilters = {
    perPages: '20',
    status: '',
    listing: true,
    paged: 1,
    search: '',
    orderby: 'updated_at',
    order: 'DESC',
}
const ListingCampaignsView = () => {
    const [data, setData] = useState<null | []>(null)
    const [popover, setPopover] = useState('')
    const [filters, setFilters] = useState(initialFilters)
    const [confirmDialog, setConfirmDialog] = useState(null);
    const {records, isLoading, onReload} = useDataRecords('campaigns', filters)
    const {pushToast} = useToasts();
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
        setIsOpen(false);
        handleBulkDelete(isOpen)
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        if (records) {
            setData({
                ...records,
                posts: records['posts'].reduce((acc, item) => {
                    acc.push({
                        id: item.ID,
                        title: item.post_title,
                        status: item.post_status,
                        content: item.content,
                        details: {
                            createdAt: item.post_date
                        },
                        // batch: records['batches'][item.ID] ?? null
                    })
                    return acc;
                }, [])
            })
        }
    }, [records]);

    const togglePopover = id => {
        if (popover === id) {
            setPopover('')
        } else {
            setPopover(id)
        }
    }

    const renderStatus = (item) => {

        switch (item.status) {
            case 'sent':
                let durationHumanized = null
                if (item.batch) {
                    const createdAt = dayjs(item.batch.created_at);
                    const updatedAt = dayjs(item.batch.updated_at);

                    let diffInMs = createdAt.diff(updatedAt);
                    durationHumanized = dayjs.duration(diffInMs).humanize();
                }
                return (
                    <VStack>
                        <Tag
                            type="success"
                            withPoint={true}
                            icon={published}
                        >
                            Sended
                        </Tag>
                        {item.batch &&
                            <HStack spacing={1} expanded={false} alignment={"left"}>
                                <Text>
                                    {__('Took', 'mailerpress')} {durationHumanized} {__('to send', 'mailerpress')}
                                </Text>
                            </HStack>
                        }
                    </VStack>
                )
            case 'draft':
                return (
                    <VStack>
                        <Tag type="warning" withPoint={true} icon={drafts}>
                            Draft
                        </Tag>
                    </VStack>
                )
            case 'in_progress':
                return <Tag type="info" withPoint={true} icon={caution}>
                    En cours d'envoi
                    - {item.batch && renderOpenPercentage(item.batch.total_emails, item.batch.sent_emails, true)}
                </Tag>
            case 'failed':
                return <Tag type="error" withPoint={true} icon={error}>
                    Echec
                </Tag>
            case 'scheduled':
                return (
                    <VStack>
                        <Tag type="info" withPoint={true} icon={scheduled}>
                            Scheduled
                        </Tag>
                        <VStack spacing={1} expanded={false} alignment={"left"}>
                            <Text variant="muted">
                                {item.batch && dayjs(item.batch.scheduled_at).format('DD/MM/YYYY à HH:mm:ss')}
                            </Text>
                            {item.batch.status === null || item.batch.status === '' ?
                                <Button onClick={() => setConfirmDialog({
                                    label: __('Are you sure you want to resume sending this campaign?', 'mailerpress'),
                                    action: () => onResumeCampaign(item.batch.id)
                                })} variant={"link"} isDestructive={false}>
                                    {__('Resume it', 'mailerpress')}
                                </Button>
                                :
                                <Button
                                    onClick={() => setConfirmDialog({
                                        label: __('Are you sure you want to cancel sending this campaign?', 'mailerpress'),
                                        action: () => onSuspedCampaign(item.batch.id)
                                    })} variant={"link"} isDestructive={true}>
                                    {__('Cancel it', 'mailerpress')}
                                </Button>
                            }
                        </VStack>
                    </VStack>
                )
            case 'pending':
                if (item.batch && item.batch.scheduled_at !== null) {
                    return <Tag type="warning" withPoint={true} icon={pending}>
                        {__('Pending', 'mailerpress')}
                    </Tag>
                } else {
                    return <Tag type="warning" withPoint={true}>
                        En attente
                    </Tag>
                }
            default:
                return <Tag type="error" withPoint={true}>
                    Canceled
                </Tag>
        }
    }

    const onSuspedCampaign = batchId => {
        ApiService.pauseBatch(batchId).then(() => {
            setConfirmDialog(null)
            // onLoadData()
        })
    }

    const renderOpenPercentage = (sent_emails, total_opens, rounded = true) => {
        if (null === total_opens || null === sent_emails) {
            return null
        }

        let openPercentage = (parseInt(total_opens) / parseInt(sent_emails)) * 100;

        if (sent_emails === 0) {
            openPercentage = 0; // Ou tout autre valeur que vous souhaitez afficher
        }

        return rounded ? Math.ceil(openPercentage) + '%' : openPercentage.toFixed(2) + "%"
    }

    const onResumeCampaign = batchId => {
        ApiService.resumeBatch(batchId).then(() => {
            setConfirmDialog(null)
            // onLoadData()
        })
    }

    const filterHasChanged = useMemo(() => {
        return JSON.stringify(filters) !== JSON.stringify(initialFilters)
    }, [filters]);

    const handleDelete = (data) => {
        ApiService.deleteCampaign([data.id]).then(res => {
            onReload()
            pushToast({
                title: __('Campaign deleted successfully', 'mailerpress'),
                type: 'success',
                duration: 5
            })
        })
    }

    const handleBulkDelete = selection => {
        if (true === selection.isAllOccurrence) {
            ApiService.deleteAllCampaign().then(() => {
                onReload()
                pushToast({
                    title: __('All Campaign(s) deleted successfully', 'mailerpress'),
                    type: 'success',
                    duration: 5
                })
            })
        } else {
            ApiService.deleteCampaign(selection.selected).then(res => {
                onReload()
                pushToast({
                    title: __('Campaign(s) deleted successfully', 'mailerpress'),
                    type: 'success',
                    duration: 5
                })
            })
        }
    }

    return (
        <ComponentWrapper
            desc={"Manage and track all your email campaigns."}
            mainTitle={__('Your campaigns', 'mailerpress')}
            actions={[
                <Button
                    icon={plus}
                    href={`${jsVars.adminUrl}?page=mailerpress/new`}
                    variant={"primary"}
                >{__('Create a campaign', 'mailerpress')}</Button>,
            ]}
        >
            <ConfirmDialog
                isOpen={isOpen}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            >
                {__('Are you sure you want to delete all selected campaigns, this action is irreversible?', 'mailerpress')}
            </ConfirmDialog>

            <div className="listing-container">
                {records === null && isLoading && <HStack justify={"center"}>
                    <div style={{padding: 16}}>
                        <Spinner/>
                    </div>
                </HStack>
                }

                {data &&
                    <>
                        <ConfirmDialog
                            isOpen={confirmDialog !== null}
                            onConfirm={confirmDialog ? confirmDialog.action : null}
                            onCancel={() => setConfirmDialog(null)}
                        >
                            {confirmDialog ? confirmDialog.label : null}
                        </ConfirmDialog>

                        <DataView
                            bulkActions={[
                                {
                                    content: __('Delete', 'mailerpress'),
                                    icon: trash,
                                    onAction: (selection) => setIsOpen(selection),
                                    isDestructive: true
                                },
                            ]}
                            onReset={() => setFilters(initialFilters)}
                            sorts={[
                                {value: "name", label: "Post Title"},
                                {value: "updated_at", label: "Last modification date"},
                                {value: "status", label: "Status"},
                            ]}
                            setFilters={setFilters}
                            tabsFilter={[
                                {
                                    active: filters.status === '',
                                    label: __('All', 'mailerpress'),
                                    onClick: () => setFilters((prevState) => ({...prevState, status: '', paged: 1}))
                                },
                                {
                                    active: filters.status === 'draft',
                                    label: __('Draft', 'mailerpress'),
                                    onClick: () => setFilters((prevState) => ({
                                        ...prevState,
                                        status: 'draft',
                                        paged: 1
                                    }))
                                },
                                {
                                    active: filters.status === 'sent',
                                    label: __('Sended', 'mailerpress'),
                                    onClick: () => setFilters((prevState) => ({
                                        ...prevState,
                                        status: 'sent',
                                        paged: 1
                                    }))
                                },
                                {
                                    active: filters.status === 'in_progress',
                                    label: __('In progress', 'mailerpress'),
                                    onClick: () => setFilters((prevState) => ({
                                        ...prevState,
                                        status: 'in_progress',
                                        paged: 1
                                    }))
                                },
                                {
                                    active: filters.status === 'failed',
                                    label: __('Error', 'mailerpress'),
                                    onClick: () => setFilters((prevState) => ({
                                        ...prevState,
                                        status: 'failed',
                                        paged: 1
                                    }))
                                },
                                {
                                    active: filters.status === 'scheduled',
                                    label: __('Scheduled', 'mailerpress'),
                                    onClick: () => setFilters((prevState) => ({
                                        ...prevState,
                                        status: 'scheduled',
                                        paged: 1
                                    }))
                                },
                                {
                                    active: filters.status === 'pending',
                                    label: __('Pending', 'mailerpress'),
                                    onClick: () => setFilters((prevState) => ({
                                        ...prevState,
                                        status: 'pending',
                                        paged: 1
                                    }))
                                },
                            ]}
                            filters={filters}
                            onUpdateFilter={(filter, val) => {
                                setFilters({
                                    ...filters,
                                    [filter]: val
                                })
                            }}
                            onSearch={search => {
                                setFilters({
                                    ...filters,
                                    search
                                })
                            }}
                            setPopover={(id) => togglePopover(id)}
                            popover={popover}
                            hasSearchBar={true}
                            data={records}
                            fields={[
                                {
                                    id: 'id',
                                    hidden: true,
                                    header: "ID",
                                    render: ({item}) => {
                                        return item.id
                                    }

                                },
                                {
                                    id: 'title',
                                    hidden: false,
                                    header: "Title",
                                    render: ({item, displayMode}) => {
                                        let data = null;

                                        if (displayMode === 'grid') {
                                            data = item.content_html
                                        }

                                        return (
                                            <VStack spacing={3} alignment={"left"}>
                                                {displayMode === 'grid' && <FrameView
                                                    onClick={() => {
                                                        window.open(`${jsVars.adminUrl}?page=mailerpress/new&edit=${item.id}`, '_blank')
                                                    }}
                                                    key={item.ID}
                                                    data={data}
                                                />}
                                                <Button
                                                    aria-pressed={false}
                                                    target="_blank"
                                                    href={`${jsVars.adminUrl}?page=mailerpress/new&edit=${item.id}`}
                                                    variant="link"
                                                >
                                                    {item.title}
                                                </Button>
                                            </VStack>
                                        )
                                    }

                                },
                                {
                                    id: 'status',
                                    maxWidth: 350,
                                    hidden: false,
                                    header: "Statut",
                                    render: ({item}) => renderStatus(item)

                                },
                                {
                                    id: 'details',
                                    hidden: false,
                                    header: "Details",
                                    maxWidth: 400,
                                    render: ({item, displayMode}) => {
                                        return (
                                            item.status === 'sent' ?
                                                <Grid columns={displayMode === 'grid' ? 2 : 4}>
                                                    <>
                                                        {item.batch !== null &&
                                                            <VStack spacing={1} alignment={'topLeft'}>
                                                                <Text
                                                                    variant={"muted"}>{__('Recipients', 'mailerpress')}</Text>
                                                                <Text size={18} weight={"bold"}>
                                                                    {item.batch.total_emails}
                                                                </Text>
                                                                <Text
                                                                    variant={"muted"}
                                                                >
                                                                    {renderOpenPercentage(item.batch.total_emails, item.batch.sent_emails, false)}
                                                                </Text>

                                                            </VStack>
                                                        }

                                                        <>
                                                            <VStack spacing={1} alignment={'topLeft'}>
                                                                <Text
                                                                    variant={"muted"}>{__('Openers', 'mailerpress')}</Text>
                                                                <Text size={18} weight={"bold"}>
                                                                    {item.statistics ? item.statistics.total_opens : '0'}
                                                                </Text>
                                                                {item.statistics &&
                                                                    <Text
                                                                        variant={"muted"}>
                                                                        {renderOpenPercentage(item.batch.sent_emails, item.statistics.total_opens, false)}
                                                                    </Text>
                                                                }
                                                            </VStack>

                                                            <VStack spacing={1} alignment={'topLeft'}>
                                                                <Text
                                                                    variant={"muted"}>{__('Clickers', 'mailerpress')}</Text>
                                                                <Text size={18} weight={"bold"}>
                                                                    {item.statistics ? item.statistics.total_clicks : '0'}
                                                                </Text>
                                                                {item.statistics &&
                                                                    <Text
                                                                        variant={"muted"}>
                                                                        {renderOpenPercentage(item.batch.sent_emails, item.statistics.total_clicks, false)}
                                                                    </Text>
                                                                }
                                                            </VStack>

                                                            <VStack spacing={1} alignment={'topLeft'}>
                                                                <Text
                                                                    variant={"muted"}>{__('Unsubscribe', 'mailerpress')}</Text>
                                                                <Text size={18} weight={"bold"}>
                                                                    {item.statistics ? item.statistics.total_unsubscribes : '0'}
                                                                </Text>
                                                                {item.statistics &&

                                                                    <Text
                                                                        variant={"muted"}>
                                                                        {renderOpenPercentage(item.batch.sent_emails, item.statistics.total_unsubscribes, false)}
                                                                    </Text>
                                                                }
                                                            </VStack>
                                                        </>


                                                        {/*<VStack spacing={1}>*/}
                                                        {/*    <Text variant={"muted"}>{t('Clickers')}</Text>*/}
                                                        {/*</VStack>*/}

                                                        {/*<VStack spacing={1}>*/}
                                                        {/*    <Text variant={"muted"}>{t('Unsubscribe')}</Text>*/}
                                                        {/*</VStack>*/}
                                                    </>
                                                </Grid> : <Notice status="warning" isDismissible={false}>
                                                    {__('Statistics are not available at this time.', 'mailerpress')}
                                                </Notice>

                                        )
                                    }
                                },
                            ]}
                            renderEmptyState={() => <EmptyState
                                createLink={`${jsVars.adminUrl}?page=mailerpress/new`}
                                resetAll={() => setFilters(initialFilters)}
                                label={__('No campaigns found')}
                                description={__('It looks like you still haven\'t created any campaigns. To get started click on the button above', 'mailerpress')}
                            />}
                            filtersHasChanged={filterHasChanged}
                            isLoading={isLoading}
                            confirmDeleteAction={handleDelete}
                        />
                    </>
                }

            </div>
        </ComponentWrapper>
    )
}
export default ListingCampaignsView