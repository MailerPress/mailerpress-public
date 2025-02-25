import React, {useEffect, useMemo, useState} from "react"
import ComponentWrapper from "../ComponentWrapper.tsx";
import {
    __experimentalHStack as HStack,
    __experimentalText as Text,
    __experimentalVStack as VStack,
    __experimentalHeading as Heading,
    Button, Spinner, DropdownMenu, MenuGroup, MenuItem, Icon, __experimentalInputControl as InputControl, Flex, FlexItem
} from "@wordpress/components";
import {arrowDown, arrowUp, category, cloud, create, external, more, moreVertical, trash} from "@wordpress/icons";
import {addClientIdImmutableWithUnique, t} from "../../../editor/src/utils/function.ts";
import DataView from "../../../components/DataView/index.tsx";
import EmptyState from "../../../components/EmptyState.tsx";
import useDataRecords from "../../../hooks/useDataRecords.ts";
import FrameView from "../../../components/FrameView.tsx";
import {JsonToMjml} from "../../../editor/src/utils/JsonToMjml.ts";
import {MjmlToJson} from "../../../editor/src/utils/MjmlToJson.ts";
import {useDispatch} from "@wordpress/data";
import {STORE_KEY} from "../../../editor/src/constants.ts";
import ReviewAndSend from "../../../editor/src/components/ReviewAndSend.tsx";
import {useModalContext} from "../../context/ModalContext.tsx";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {Inputs} from "../../../editor/src/components/StartCampaignForm.tsx";
import {ApiService} from "../../../editor/src/core/apiService.ts";
import {useURL} from "../../context/UrlContext.tsx";

const intitalFilters = {
    perPages: 8,
    paged: 1,
    search: '',
    orderby: 'created_at',
    order: 'DESC',
    internal: '0,1',
}

const StartCampaign = ({item}) => {

    const {
        control,
        handleSubmit,
        watch,
        formState: {
            isValid
        }
    } = useForm<Inputs>({
        defaultValues: {
            campaignName: '',
            sendChoice: 'now',
            sendAt: new Date()
        },
    })

    let json = null;
    if (item.content.startsWith('<mjml>')) {
        json = MjmlToJson(item.content)
    } else {
        json = JSON.parse(item.content)
    }

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        ApiService.createCampaign({
            title: data.campaignName,
            meta: {
                json: addClientIdImmutableWithUnique(json),
                emailConfig: {
                    campaignSubject: data.campaignSubject,
                    hasBatch: "",
                    sendChoice: data.sendChoice,
                    sendAt: data.sendAt,
                }
            }
        }).then((ID) => {
            window.open(`${jsVars.adminUrl}?page=mailerpress/new&edit=${ID}`, "_blank");
        })
    }

    return (
        <form className="start-campaign-form" onSubmit={handleSubmit(onSubmit)}>
            <Flex expanded={false} justify={"flex-start"} direction={"column"}>
                <FlexItem>
                    <Controller
                        name="campaignName"
                        control={control}
                        rules={{required: true}}
                        render={({field: {onChange, value}}) => <InputControl
                            value={value}
                            help={t('The campaign name is only visible from the WordPress administration interface.')}
                            label={t('Campaign name *')}
                            onChange={onChange}
                        />}
                    />
                </FlexItem>
                <FlexItem>
                    <Controller
                        name="campaignSubject"
                        control={control}
                        rules={{required: true}}
                        render={({field: {onChange, value}}) => <InputControl
                            value={value}
                            help={t('This text will be displayed in the title of the email your recipients will receive.')}
                            label={t('Campaign subject *')}
                            onChange={onChange}
                        />}
                    />
                </FlexItem>
            </Flex>

            <div className={"sticky-footer"}>
                <HStack justify={"center"}>
                    <Button disabled={!isValid} type={"submit"}
                            variant={"primary"}>{t('Start composing email')}</Button>
                </HStack>
            </div>
        </form>
    )

}

const TemplateScreen = () => {
    const {activeView} = useURL();
    const [filters, setFilters] = useState({
        ...intitalFilters,
        category: activeView
    })
    const [defaultView] = useState('grid')
    const {records, isLoading, setRecords} = useDataRecords('templates/all', filters);
    const {setModal} = useModalContext();

    const createDraftCampaign = (item) => {
        setModal({
            title: t('Campaign name'),
            size: 'small',
            component: <StartCampaign item={item}/>
        })
    }

    useEffect(() => {
        setRecords(null)
        if (activeView !== null && activeView !== filters.category) {
            if ('' === activeView) {
                setFilters({
                    ...filters,
                    category: ''
                })
            } else {
                setFilters({
                    ...filters,
                    category: activeView
                })
            }

        }
    }, [activeView]);

    const filterHasChanged = useMemo(() => {
        return JSON.stringify(filters) !== JSON.stringify(intitalFilters)
    }, [filters]);

    return (
        <ComponentWrapper desc="Pre-designed layouts for your emails." mainTitle={"Templates"} actions={[
            <Button
                icon={create}
                variant={"primary"}
            >{t('Create template')}</Button>
        ]}>
            {records === null && isLoading && <HStack justify={"center"}>
                <div style={{padding: 16}}>
                    <Spinner/>
                </div>
            </HStack>
            }
            {records &&
                <DataView
                    setFilters={setFilters}
                    tabsFilter={[
                        {
                            active: filters.internal === '0,1',
                            label: t('All'),
                            onClick: () => setFilters((prevState) => ({
                                ...prevState,
                                internal: '0,1',
                                paged: 1
                            }))
                        },
                        {
                            active: filters.internal === '1',
                            label: t('Premium'),
                            onClick: () => setFilters((prevState) => ({
                                ...prevState,
                                internal: '1',
                                paged: 1
                            }))
                        },
                        {
                            active: filters.internal === '0',
                            label: t('Your templates'),
                            onClick: () => setFilters((prevState) => ({
                                ...prevState,
                                internal: '0',
                                paged: 1
                            }))
                        },
                    ]}
                    filters={filters}
                    isLoading={isLoading}
                    displayMode={"grid"}
                    hasSearchBar={true}
                    sorts={[
                        {value: "name", label: t('Name')},
                        {value: "created_at", label: t('Created at')},
                        {value: "updated_at", label: t('Updated at')},
                    ]}
                    onSearch={search => {
                        setFilters((prevState) => ({...prevState, search}))
                    }}
                    fields={[
                        {
                            id: 'content',
                            hidden: false,
                            header: "content",
                            render: ({item}) => {
                                let data = null;
                                if (item.content.startsWith('<mjml>')) {
                                    data = MjmlToJson(item.content)
                                } else {
                                    data = JSON.parse(item.content)
                                }

                                return <FrameView
                                    onClick={() => createDraftCampaign(item)}
                                    key={item.ID}
                                    data={data}
                                />

                            }
                        },
                        {
                            id: 'name',
                            hidden: false,
                            header: "name",
                            render: ({item}) => {
                                return (
                                    <HStack justify={"space-between"}>
                                        <Heading level={3}>
                                            {item.name}
                                        </Heading>
                                        <Flex gap={0} expanded={false} justify={"flex-start"}>
                                            {item.internal === "0" &&
                                                <FlexItem>
                                                    <Icon icon={cloud}/>
                                                </FlexItem>
                                            }
                                            <FlexItem>
                                                <DropdownMenu icon={moreVertical} label="Select a direction">
                                                    {({onClose}) => (
                                                        <>
                                                            <MenuGroup>
                                                                <MenuItem icon={create} onClick={() => {
                                                                    onClose()
                                                                    createDraftCampaign(item)
                                                                }
                                                                }>
                                                                    {t('Start with this template')}
                                                                </MenuItem>
                                                            </MenuGroup>
                                                            {item.internal === "0" &&
                                                                <MenuGroup>
                                                                    <MenuItem isDestructive={true} icon={trash}
                                                                              onClick={onClose}>
                                                                        Remove
                                                                    </MenuItem>
                                                                </MenuGroup>
                                                            }
                                                        </>
                                                    )}
                                                </DropdownMenu>
                                            </FlexItem>
                                        </Flex>
                                    </HStack>
                                )
                            }
                        },
                        {
                            id: 'description',
                            hidden: false,
                            header: "description",
                            render: ({item}) => {
                                return (
                                    <Text variant="muted">
                                        {item.description}
                                    </Text>
                                )
                            }
                        },
                        {
                            id: 'category',
                            hidden: false,
                            header: "category",
                            render: ({item}) => {
                                return (
                                    <HStack spacing={1} alignment={"left"}>
                                        <Icon size={20} icon={category}/>
                                        <Text>
                                            {item.category.split('/').join(', ')}
                                        </Text>
                                    </HStack>
                                )
                            }

                        },
                    ]}
                    data={records}
                    onUpdateFilter={(filter, val) => {
                        setFilters({
                            ...filters,
                            [filter]: val
                        })
                    }}
                    renderEmptyState={() => <EmptyState
                        resetAll={() => setFilters(intitalFilters)}
                        label={t('No templates found')}
                        description={t('It looks like your templates list is empty.')}
                    />}
                    filtersHasChanged={filterHasChanged}
                />
            }
        </ComponentWrapper>
    )
}
export default TemplateScreen