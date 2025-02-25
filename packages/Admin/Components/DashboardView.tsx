import React, {useEffect, useRef, useState} from "react"
import {
    __experimentalSpacer as Spacer,
    __experimentalText as Text,
    Flex, MenuGroup, MenuItem, Popover, ToolbarButton, Card, Button,
} from "@wordpress/components";
import {edit, plus, moreHorizontal, trash} from "@wordpress/icons";
import {__} from "@wordpress/i18n";
import ComponentWrapper from "./ComponentWrapper.tsx";
import apiFetch from "@wordpress/api-fetch";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {decodeHtml} from "../../components/ListingCampaigns.tsx";
import TodaySummary from "./Dashboard/TodaySummary.tsx";
import LatestCampaigns from "./Dashboard/LatestCampaigns.tsx";
import ContactsSummary from "./Dashboard/ContactsSummary.tsx";
import EmailPerformance from "./Dashboard/EmailPerformance.tsx";

const DashboardView = () => {

    const [draftItems, setDraftItems] = useState<null | []>(null)

    useEffect(() => {
        apiFetch({path: '/mailerpress/v1/campaigns?status=draft&per_page=5'}).then((posts) => {
            setDraftItems(posts);
        });
    }, []);

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
                <>
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

                </>
            )
        }

        return (
            <div className="last-draft-container">
                <Text weight="700">{__('Recently draft campaign', 'mailerpress')}</Text>
                <div className="draft-list">
                    {draftItems.map(draftItem => <DrafItem item={draftItem}/>)}
                </div>
            </div>
        )
    }


    return (
        <ComponentWrapper desc="Central hub for managing and monitoring your email activities." mainTitle={"Home"} classes={'mailerpress-dashboard'} actions={[
            <Button
                icon={plus}
                href={`${jsVars.adminUrl}?page=mailerpress/new`}
                variant={"primary"}
            >{__('Create a campaign', 'mailerpress')}</Button>,
        ]}>
            <TodaySummary/>
            <Spacer marginY={4}/>
            <Flex gap={4} align={"flex-start"}>
                <div style={{width: '60%'}}>
                    <Card size={"xSmall"}>
                        <LatestCampaigns/>
                    </Card>
                    <Spacer marginY={4}/>
                    <ContactsSummary/>
                </div>
                <div style={{width: '40%'}}>
                    <EmailPerformance/>
                    <Spacer marginY={4}/>
                </div>

            </Flex>

            {/*{draftItems && draftItems.length > 0 && <LastDraft draftItems={draftItems}/>}*/}
        </ComponentWrapper>
    )
}
export default DashboardView