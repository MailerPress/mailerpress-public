import {__} from "@wordpress/i18n";
import {
    __experimentalText as Text,
    __experimentalHStack as HStack,
    Button,
    MenuGroup,
    MenuItem,
    Popover,
    ToolbarButton,
    Spinner
} from "@wordpress/components";
import {edit, moreHorizontal, trash} from "@wordpress/icons";
import {useEffect, useRef, useState} from "react";
import apiFetch from "@wordpress/api-fetch";
import DataView from "./DataView/index.tsx";
import dayjs from "dayjs";
import EmptyState from "./EmptyState.tsx";
import {t} from "../editor/src/utils/function.ts";
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'

export function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

const LastDraft = ({draftItems}) => {
    dayjs.extend(relativeTime)
    dayjs.locale('fr') // switch back to default English locale globally

    const DrafItem = ({item}) => {
        const [isVisible, setIsVisible] = useState(false);
        const iframe = useRef();
        const toggleVisible = () => {
            setIsVisible((state) => !state);
        };

        useEffect(() => {
            if (iframe.current) {
                iframe.current.contentDocument.body.innerHTML = decodeHtml(item.post_content);
            }
        }, [iframe]);

        const onEdit = (post) => {
            window.open(`${jsVars.adminUrl}?page=mailerpress/new&edit=${post.ID}`, "_blank");
        }

        return (
            <div className="draft-list__item">
                <div className="draft-list__item__preview">
                    <iframe ref={iframe} width="100%" height="100%"/>
                </div>
                <div className="draft-list__item__footer">
                    <Text>
                        {dayjs(item.post_modified).fromNow()}
                    </Text>
                    <ToolbarButton
                        icon={moreHorizontal}
                        label={'Settings'}
                        onClick={toggleVisible}
                    />
                </div>
                {isVisible && <Popover placement="bottom-end" offset={5}>
                    <div style={{padding: 4}}>
                        <MenuGroup>
                            <MenuItem icon={edit} onClick={() => onEdit(item)}>Edit</MenuItem>
                            <MenuItem isDestructive icon={trash}>Delete</MenuItem>
                        </MenuGroup>
                    </div>
                </Popover>}
            </div>
        )
    }

    return (
        <div className="last-draft-container">
            <Text weight="700">{__('Recent drafts', 'mailerpress')}</Text>
            <div className="draft-list">
                {draftItems.map(draftItem => <DrafItem item={draftItem}/>)}
            </div>
        </div>
    )
}

const Listing = () => {
    const [data, setData] = useState<null | []>(null)
    const [popover, setPopover] = useState('')
    const [filters, setFilters] = useState({
        perPages: 10,
        status: ['draft', 'publish']
    })

    useEffect(() => {
        apiFetch({path: `/mailerpress/v1/campaigns?status=${filters.status.join(',')}&per_page=${filters.perPages}&listing`}).then((posts) => {
            setData(
                posts['posts'].reduce((acc, item) => {
                    acc.push({
                        id: item.ID,
                        title: item.post_title,
                        status: item.post_status,
                        content: item.post_content,
                        batch: posts['batches'][item.ID] ?? null,
                        details: '',
                    })
                    return acc;
                }, [])
            )
        });
    }, []);

    const togglePopover = id => {
        if (popover === id) {
            setPopover('')
        } else {
            setPopover(id)
        }
    }

    return (
        <div className="listing-container">
            <header>
                <Text size={20} weight="700">{__('Campaigns')}</Text>
                <Button variant="primary" href={`${jsVars.adminUrl}?page=mailerpress/new`}>Create campaign</Button>
            </header>
            {data === null && <HStack justify={"center"}>
                <div style={{padding: 16}}>
                    <Spinner/>
                </div>
            </HStack>}
            {data &&
                <>
                    {data.length > 0 ? <DataView
                        setPopover={(id) => togglePopover(id)}
                        popover={popover}
                        hasSearchBar={true}
                        data={data}
                        actions={[
                            {
                                RenderModal: function noRefCheck() {
                                },
                                hideModalHeader: true,
                                icon: trash,
                                id: 'delete',
                                isPrimary: true,
                                label: 'Delete item'
                            },
                            {
                                callback: function noRefCheck() {
                                },
                                id: 'secondary',
                                label: 'Secondary action'
                            }
                        ]}
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
                                header: "Title",
                                render: ({item}) => {
                                    return (
                                        <Button
                                            target="_blank"
                                            href={`${jsVars.adminUrl}?page=mailerpress/new&edit=${item.id}`}
                                            variant="link"
                                        >
                                            {item.title}
                                        </Button>
                                    )
                                }

                            },
                            {
                                id: 'status',
                                header: "Statut",
                                render: ({item}) => {
                                    return item.status
                                }

                            },
                            {
                                id: 'details',
                                header: "Details",
                                maxWidth: 400,
                                render: ({item}) => {
                                    return (
                                        <>
                                            <div>
                                                <Text variant="muted">Créé par</Text> <Text>Emilien Laborde</Text>
                                            </div>
                                            <div>
                                                <Text variant="muted">Le</Text> <Text>11 juin 2024</Text>
                                            </div>
                                            <div>
                                                <Text variant="muted">Date d’envoi :</Text> <Text>27 avril 2023 14 h 00
                                                min</Text>
                                            </div>
                                        </>
                                    )
                                }
                            },
                            {
                                id: 'Actions',
                                header: "Actions",
                                maxWidth: 50,
                            }
                        ]}
                    /> : <EmptyState
                        label={__('No campaigns found', 'mailerpress')}
                        description={__('It looks like you still haven\'t created any campaigns. To get started click on the button above', 'mailerpress')}
                    />
                    }
                </>
            }

        </div>
    )

}

const ListingCampaigns = () => {

    const [draftItems, setDraftItems] = useState<null | []>(null)

    useEffect(() => {
        apiFetch({path: '/mailerpress/v1/campaigns?status=draft&per_page=5'}).then((posts) => {
            setDraftItems(posts);
        });
    }, []);

    return (
        <div className="component-view">
            <>
                {draftItems && draftItems.length > 0 && <LastDraft draftItems={draftItems}/>}
                <Listing/>
            </>
        </div>
    )
}
export default ListingCampaigns