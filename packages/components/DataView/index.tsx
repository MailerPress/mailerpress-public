import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {
    __experimentalInputControl as InputControl,
    __experimentalInputControlPrefixWrapper as InputControlSuffixWrapper,
    __experimentalHeading as Heading,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    __experimentalSpacer as Spacer,
    __experimentalGrid as Grid,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalItemGroup as ItemGroup,
    __experimentalItem as Item,
    MenuGroup,
    MenuItem,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalText as Text,
    Button,
    DropdownMenu,
    Modal,
    __experimentalConfirmDialog as ConfirmDialog,
    SelectControl,
    Flex,
    Spinner,
    Popover,
    Dropdown,
    MenuItemsChoice, CheckboxControl
} from "@wordpress/components";
import {
    closeSmall,
    Icon,
    search,
    trash,
    moreVertical,
    seen,
    edit,
    next,
    previous,
    cog, arrowUp, arrowDown, unseen, blockTable, chevronDown
} from "@wordpress/icons";
import {t} from "../../editor/src/utils/function.ts";
import {decodeHtml} from "../ListingCampaigns.tsx";
import {debounce} from "lodash";
import cx from "classnames/bind";
import FrameView from "../FrameView.tsx";
import {MjmlToJson} from "../../editor/src/utils/MjmlToJson.ts";
import useDataListSelector from "../../hooks/useDataListSelector.ts";
import {sprintf, __} from '@wordpress/i18n';

type fields = {
    id: string,
    hidden: boolean,
    render?: FC<{ item }>,
    maxWidth?: number,
    header: string,

}

interface DataViewProps {
    hasSearchBar: boolean,
    isLoading: boolean,
    fields: Array<fields>,
    popover: string,
    data: [],
    onUpdateFilter: Function,
    onSearch: Function,
    filters: Object,
    setPopover: Function,
    primaryActions: Array<React.ReactNode | null>,
    renderEmptyState: FC,
    onPreview: Function,
    tabsFilter?: Array<Record<string, unknown>>,
    onReset?: Function,
    filtersHasChanged: boolean,
    setFilters: Function,
    sorts: Array<Record<string, unknown>>,
    displayMode?: string,
    confirmDeleteAction: Function,
    bulkActions?: Array<Record<string, unknown>>
}

const PreviewCampaign = ({content}) => {
    const data = useMemo(() => {
        if (content.startsWith('<mjml>')) {
            return MjmlToJson(content)
        } else {
            return JSON.parse(content)
        }
    }, [content])

    return <FrameView
        data={data}
    />
}

const index = ({
                   hasSearchBar,
                   isLoading,
                   fields,
                   data,
                   popover,
                   setPopover,
                   onSearch,
                   renderEmptyState,
                   onUpdateFilter,
                   filters,
                   primaryActions,
                   onPreview,
                   tabsFilter,
                   onReset,
                   filtersHasChanged,
                   setFilters,
                   sorts,
                   displayMode,
                   confirmDeleteAction,
                   bulkActions
               }: DataViewProps) => {
    const [defaultView, setDefaultView] = useState(displayMode || 'table')
    const [searchValue, setSearchValue] = useState(filters?.search || '')
    const [isSettingPopoverOpen, setIsSettingPopoverOpen] = useState(false)
    const [previewOpen, setPreviewOpen] = useState<boolean | []>(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const options = useRef();
    const {pushToSelection, selection} = useDataListSelector()

    const openModal = (id: number) => setPreviewOpen(id);
    const closeModal = () => setPreviewOpen(false);

    const [fieldsState, setFieldsState] = useState(fields)

    const renderField = useMemo(() => {
        return (d) => {
            return Object.entries(d).map((entry, i) => {
                const field = fieldsState[i];
                if (field) {
                    const isVisible = field.hidden === false || field.hidden === undefined;

                    if (isVisible) {
                        if (defaultView === 'grid') {
                            return (
                                <div key={i}>
                                    {field.render({item: d, displayMode: "grid"})}
                                </div>
                            );
                        } else {
                            return (
                                <th key={i}>
                                    {field.render({item: d, displayMode: "table"})}
                                </th>
                            );
                        }
                    }
                }
                return null; // Return null if no field should be rendered
            });
        };
    }, [defaultView]);

    const onEdit = (id) => {
        window.open(`${jsVars.adminUrl}?page=mailerpress/new&edit=${id}`, "_blank");
    }

    const onPreviewFunc = (d) => {
        openModal(d)
    }

    const confirmDelete = (d) => {
        setConfirmDialog(d)
    }

    const verify = useCallback(
        debounce((value) => {
            onSearch(value)
        }, 350),
        []
    );

    const searchString = useMemo(() => {
        return filters?.search || ''
    }, [filters]);

    const showSettings = useCallback(() => {
        setIsSettingPopoverOpen((prevState) => !prevState);
    }, []);

    // Only create the Popover content when isSettingPopoverOpen changes
    const popoverContent = useMemo(() => {
        return (
            <Popover anchor={options.current} offset={8} shift={true}>
                <div style={{padding: 8, width: 350}} className={"listing-options"}>
                    <Heading level={4}>{t('Appearance')}</Heading>
                    <Spacer marginY={3}/>
                    <Grid
                        className="listing-options__content"
                        columns={12}
                        gap={2}
                    >
                        {sorts !== undefined && sorts.length > 0 &&
                            <HStack className="is-divided-in-two" expanded={true}>
                                <SelectControl
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                    label={t('Sort by')}
                                    onChange={val => setFilters((prevState) => ({
                                        ...prevState,
                                        orderby: val,
                                    }))}
                                    value={filters && filters?.orderby}
                                    options={sorts}
                                />
                                <ToggleGroupControl
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                    isBlock
                                    value={filters && filters?.order}
                                    label={t('Order')}
                                    onChange={val => setFilters((prevState) => ({
                                        ...prevState,
                                        order: val,
                                    }))}
                                >
                                    <ToggleGroupControlOptionIcon
                                        icon={arrowUp}
                                        label={t('Sort ascending')}
                                        value="ASC"
                                    />
                                    <ToggleGroupControlOptionIcon
                                        icon={arrowDown}
                                        label={t('Sort descending')}
                                        value="DESC"
                                    />
                                </ToggleGroupControl>
                            </HStack>
                        }
                        <ToggleGroupControl
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            isBlock
                            label={t('Items per page')}
                            onChange={val => setFilters((prevState) => ({
                                ...prevState,
                                perPages: val,
                            }))}
                            value={filters?.perPages}
                        >
                            <ToggleGroupControlOption
                                label="10"
                                value="10"
                            />
                            <ToggleGroupControlOption
                                label="20"
                                value="20"
                            />
                            <ToggleGroupControlOption
                                label="50"
                                value="50"
                            />
                            <ToggleGroupControlOption
                                label="100"
                                value="100"
                            />
                        </ToggleGroupControl>
                    </Grid>
                    <Spacer marginY={3}/>
                    <Heading level={4}>{t('Properties')}</Heading>
                    <Spacer marginY={3}/>
                    <ItemGroup
                        isBordered
                        isSeparated
                        size={"large"}
                    >
                        {fieldsState && fieldsState.map(field =>
                            <Item onClick={function noRefCheck() {
                            }}>
                                <HStack>
                                    <Text>{field.header}</Text>
                                    <Button
                                        onClick={() => updateVisibilityFields(field)}
                                        icon={field.hidden ? unseen : seen}
                                    />
                                </HStack>
                            </Item>
                        )}
                    </ItemGroup>
                </div>
            </Popover>
        );
    }, [isSettingPopoverOpen, filters, sorts, fieldsState]);

    const updateVisibilityFields = field => {
        setFieldsState(
            fieldsState.map(f => {
                if (f.id === field.id) {
                    return {
                        ...f,
                        hidden: !f.hidden
                    }
                }

                return f
            })
        )
    }

    const toggleCheck = d => {
        if (selection.selected.includes(d.id)) {
            pushToSelection(
                {
                    ...selection,
                    selected: selection.selected.filter(id => parseInt(id) !== parseInt(d.id))
                }
            )
        } else {
            pushToSelection(
                {
                    ...selection,
                    selected: [
                        ...selection.selected,
                        d.id
                    ]
                }
            )
        }
    }

    const handleSelectAll = () => {
        if (selection && selection.length === data.posts.length || selection.isAllOccurrence) {
            pushToSelection({selected: [], isAllOccurrence: false})
        } else {
            const selected = data.posts.reduce((acc, item) => {
                acc.push(item.id)
                return acc
            }, [])
            pushToSelection(
                {
                    isAllOccurrence: parseInt(selected.length) === parseInt(data.count),
                    selected
                }
            )
        }

    }

    const handleSelectAllOccurrence = () => {
        if (selection.isAllOccurrence) {
            pushToSelection(
                {
                    selected: [],
                    isAllOccurrence: false
                }
            )
        } else {
            pushToSelection(
                {
                    selected: data.posts.reduce((acc, item) => {
                        acc.push(item.id)
                        return acc
                    }, []),
                    isAllOccurrence: true
                }
            )
        }

    }

    return (
        <>
            <div className="data-view-component">
                <div className="data-view-component__wrapper">
                    <div className="before-table">
                        <HStack spacing={1}>
                            <div className={'before-table__left'}>
                                <HStack expanded={false}>
                                    {hasSearchBar &&
                                        <InputControl
                                            placeholder="Search..."
                                            value={searchString}
                                            onChange={verify}
                                            suffix={
                                                <InputControlSuffixWrapper __next40pxDefaultSize>
                                                    <div style={{display: 'flex', marginRight: 6}}>
                                                        {searchString === '' && <Icon icon={search}/>}
                                                        {searchString !== '' &&
                                                            <Icon onClick={() => onSearch('')} icon={closeSmall}/>}
                                                    </div>
                                                </InputControlSuffixWrapper>
                                            }
                                        />
                                    }
                                    <>
                                        <Button
                                            isPressed={isSettingPopoverOpen}
                                            ref={options}
                                            icon={cog}
                                            onClick={showSettings}
                                        />
                                        {isSettingPopoverOpen && popoverContent}
                                    </>
                                    <Button variant={"link"} onClick={onReset}
                                            disabled={!filtersHasChanged}>Reset</Button>
                                    {isLoading && <Spinner/>}
                                </HStack>
                                <DropdownMenu icon={blockTable} label="Select a direction">
                                    {({onClose}) => (
                                        <>
                                            <MenuGroup>
                                                <MenuItemsChoice
                                                    choices={[
                                                        {
                                                            label: 'Table',
                                                            value: 'table'
                                                        },
                                                        {
                                                            label: 'Grid',
                                                            value: 'grid'
                                                        },
                                                    ]}
                                                    onSelect={setDefaultView}
                                                    value={defaultView}
                                                />
                                            </MenuGroup>
                                        </>
                                    )}
                                </DropdownMenu>
                            </div>
                            {primaryActions && primaryActions.length > 0 &&
                                <Flex expanded={false}>
                                    {primaryActions.map(component => <div>{component}</div>)}
                                </Flex>
                            }
                        </HStack>
                    </div>
                    {tabsFilter !== undefined && tabsFilter.length > 0 &&
                        <div style={{marginTop: 8}} className={"table-tabs"}>
                            <HStack expanded={false} justify={"space-between"}>
                                <div>
                                    {tabsFilter.map(tab => {
                                        return (
                                            <Text className={cx({"table-tabs__active": tab.active})}
                                                  weight={tab.active ? 'bold' : 'normal'} onClick={tab.onClick}
                                                  capitalize={true}>{tab.label}</Text>
                                        )
                                    })}
                                </div>
                            </HStack>
                        </div>
                    }
                    {!isLoading && data && data?.posts?.length > 0 ?
                        defaultView === 'grid' ?
                            <>
                                <Spacer marginTop={4}/>
                                <Grid
                                    alignment="top"
                                    justify={"center"}
                                    columns={4}
                                    gap={4}
                                >
                                    {
                                        data?.posts?.map(d => <VStack className={"data-view-grid-item"} spacing={2}>
                                            {renderField(d)}
                                        </VStack>)
                                    }
                                </Grid>
                            </>
                            :
                            <>
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                        {selection.selected.length > 0 && bulkActions !== undefined && <div style={{
                                            position: 'absolute',
                                            height: '100%',
                                            width: 'calc(100% - 48px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            right: '0',
                                            borderBottom: '1px solid #f0f0f0',
                                            background: '#fff',
                                            boxSizing: 'border-box'
                                        }}>
                                            <HStack spacing={3} expanded={false} alignment={"left"} justify={"center"}>
                                                <Text weight={"bold"}>
                                                    {
                                                        sprintf(__('%d of %s selected', 'mailerpress'), selection.isAllOccurrence ? data.count : selection.selected.length, data.count)
                                                    }
                                                </Text>
                                                <Button size={'compact'} variant={"tertiary"}
                                                        onClick={handleSelectAllOccurrence}>
                                                    {selection.isAllOccurrence ? t('Unselect all') : t('Select all')} {data.count} {t('records')}
                                                </Button>
                                            </HStack>
                                            {<HStack
                                                style={{flex: 1}}
                                                expanded={true}
                                                justify={"flex-end"}
                                                alignment={"end"}>
                                                {bulkActions.map(action => {
                                                    return action.actions === undefined ?
                                                        <Button
                                                            isDestructive={action.isDestructive ?? false}
                                                            size={"compact"}
                                                            iconPosition={"left"}
                                                            icon={action.icon ?? null}
                                                            variant={"tertiary"}
                                                            onClick={() => {
                                                                action.onAction(selection)
                                                                pushToSelection({
                                                                    isAllOccurrence: false,
                                                                    selected: []
                                                                })
                                                            }}
                                                        >
                                                            {action.content}
                                                        </Button>
                                                        : <Dropdown
                                                            popoverProps={{placement: 'bottom-start'}}
                                                            renderToggle={({isOpen, onToggle}) => (
                                                                <Button
                                                                    size={"compact"}
                                                                    iconPosition={"left"}
                                                                    icon={chevronDown}
                                                                    variant="tertiary"
                                                                    onClick={onToggle}
                                                                    aria-expanded={isOpen}
                                                                >
                                                                    {action.title}
                                                                </Button>
                                                            )}
                                                            renderContent={() => {
                                                                return (
                                                                    action.actions.map(a => <MenuItem
                                                                        icon={a.icon ?? null}
                                                                        onClick={() => {
                                                                            a.onClick(selection)
                                                                            pushToSelection({
                                                                                isAllOccurrence: false,
                                                                                selected: []
                                                                            })
                                                                        }}

                                                                    >
                                                                        {a.title}
                                                                    </MenuItem>)
                                                                )
                                                            }

                                                            }
                                                        />
                                                })}
                                            </HStack>
                                            }
                                        </div>
                                        }
                                        <tr>
                                            {bulkActions !== undefined &&
                                                <th>
                                                    <CheckboxControl
                                                        indeterminate={selection.selected.length > 0 && (selection.selected.length < data.posts.length)}
                                                        checked={selection.selected.length > 0 && (selection.selected.length === data.posts.length)}
                                                        onChange={
                                                            handleSelectAll
                                                        }
                                                    />
                                                </th>
                                            }

                                            {
                                                fieldsState.filter(f => f.hidden === undefined || f.hidden === false).map(field =>
                                                    <th
                                                        key={field.id}
                                                        style={{
                                                            width: `${field.maxWidth}px`,

                                                        }}>
                                                        {field.header}
                                                    </th>)
                                            }

                                            <th
                                                key='actions'
                                                style={{
                                                    width: `50px`,
                                                }}
                                            >
                                                {t('Actions')}
                                            </th>


                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            data?.posts?.map(d =>
                                                <tr>
                                                    {bulkActions !== undefined &&
                                                        <th style={{width: 32}}>
                                                            <CheckboxControl
                                                                onChange={() => toggleCheck(d)}
                                                                checked={selection.selected.includes(d.id)}
                                                            />
                                                        </th>
                                                    }
                                                    {renderField(d)}
                                                    <th>
                                                        <HStack spacing={0}>
                                                            {confirmDeleteAction !== undefined &&
                                                                <Button
                                                                    className="hidden"
                                                                    icon={trash}
                                                                    onClick={() => confirmDelete(d)}
                                                                />
                                                            }
                                                            <Button
                                                                className="hidden"
                                                                icon={seen}
                                                                onClick={() => onPreview !== undefined ? onPreview(d) : onPreviewFunc(d)}
                                                            />
                                                            <DropdownMenu
                                                                controls={[
                                                                    {
                                                                        onClick: () => onEdit(d.id),
                                                                        title: 'Edit'
                                                                    },
                                                                    {
                                                                        onClick: () => confirmDeleteAction !== undefined ? confirmDelete(d) : null,
                                                                        title: 'Delete'
                                                                    },
                                                                    {
                                                                        onClick: function noRefCheck() {
                                                                        },
                                                                        title: 'View stats'
                                                                    }
                                                                ]}
                                                                icon={moreVertical}
                                                                onToggle={function noRefCheck() {
                                                                }}
                                                            />

                                                        </HStack>
                                                    </th>
                                                </tr>
                                            )

                                        }
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        : <div style={{marginTop: 16}}>
                            {data && data?.posts?.length === 0 && renderEmptyState && renderEmptyState()}
                        </div>
                    }
                </div>
                <ConfirmDialog
                    isOpen={confirmDialog !== false}
                    onConfirm={() => {
                        setConfirmDialog(false)
                        confirmDeleteAction(confirmDialog)
                    }}
                    onCancel={() => setConfirmDialog(false)}
                >
                    {
                        t('Are you sure you want to delete this record?')
                    }
                </ConfirmDialog>

                {previewOpen !== false && (
                    <Modal
                        headerActions={
                            <HStack expanded={false}>
                                <Button href={`${jsVars.adminUrl}?page=mailerpress/new&edit=${previewOpen.id}`}
                                        icon={edit}
                                        variant={"tertiary"}>
                                    {t('Edit campaign')}
                                </Button>
                            </HStack>
                        }
                        size={"large"}
                        // isFullScreen={true}
                        title={t('Preview')}
                        onRequestClose={closeModal}
                    >
                        <PreviewCampaign content={previewOpen.content}/>
                    </Modal>
                )}
            </div>
            <div className="footer">
                <HStack alignment={"right"} justify={"space-between"}>
                    <div>
                        <Text weight={"bold"}>
                            {data?.count > 1 ? `${data.count} results` : `${data.count} result`}
                        </Text>
                    </div>
                    {data.pages > 1 &&
                        <div className="pagination">
                            <Text size={11} weight={"medium"} uppercase={true}>
                                {t('Page')}
                            </Text>
                            <SelectControl
                                __nextHasNoMarginBottom
                                onChange={val => onUpdateFilter('paged', parseInt(val))}
                                value={filters.paged}
                                options={
                                    Array(parseInt(data.pages)).fill().map((_, i) => i + 1).reduce((acc, item) => {
                                        acc.push({
                                            label: `${item}`,
                                            value: item
                                        })
                                        return acc
                                    }, [])
                                }
                            />
                            <Text size={11} weight={"medium"} uppercase={true}>
                                {t('of')} {data.pages}
                            </Text>

                            <Button
                                onClick={() => onUpdateFilter('paged', filters.paged - 1)}
                                icon={previous}
                                disabled={filters.paged === 1 || isLoading}
                            />
                            <Button
                                onClick={() => onUpdateFilter('paged', filters.paged + 1)}
                                icon={next}
                                disabled={filters.paged === data.pages || isLoading}
                            />
                        </div>
                    }
                </HStack>
            </div>
        </>
    )
}
export default index