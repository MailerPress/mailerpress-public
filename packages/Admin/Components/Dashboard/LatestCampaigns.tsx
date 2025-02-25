import React, {useEffect, useState} from "react"
import {
    __experimentalHeading as Heading,
    __experimentalVStack as VStack,
    __experimentalHStack as HStack,
    Button,
    CardBody,
    CardHeader,
    Flex,
    __experimentalText as Text,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption, __experimentalDivider as Divider
} from "@wordpress/components";
import {__, sprintf} from "@wordpress/i18n";
import {plus} from "@wordpress/icons";
import Badge from "../UI/Badge.tsx";

export const LineCampaign = () => {
    return (
        <Flex align={"center"} justify={"space-between"} className={"listing-dashboard-campaign__item"}>
            <div style={{flex: 1}}>
                <VStack spacing={2}>
                    <Text weight={"600"} size={14}>Campaign name</Text>
                    <Text variant={"muted"} size={12}>Sent on January 24, 2025</Text>
                    <Badge type={"success"} label={__('Sended', 'mailerpress')}/>
                </VStack>
            </div>
            <div>
                <HStack expanded={false} spacing={4}>
                    <VStack spacing={1}>
                        <Text variant={"muted"}>{__('Openers', 'mailerpress')}</Text>
                        <Text size={18} weight={"bold"}>0</Text>
                        <Text variant={"muted"}>0%</Text>
                    </VStack>

                    <VStack spacing={1}>
                        <Text variant={"muted"}>{__('Clickers', 'mailerpress')}</Text>
                        <Text size={18} weight={"bold"}>0</Text>
                        <Text variant={"muted"}>0%</Text>
                    </VStack>
                </HStack>
            </div>
        </Flex>
    )
}

const LatestCampaigns = () => {

    const [period, setPeriod] = useState('7')

    return (
        <div className={"listing-dashboard-campaign"}>
            <CardHeader>
                <Flex align={"center"} justify={"space-between"}>
                    <Heading level={4}>
                        {__('Your latest campaigns', 'mailerpress')}
                    </Heading>
                    <Button
                        target={"_blank"}
                        icon={plus}
                        href={`${jsVars.adminUrl}?page=mailerpress/new`}
                        variant={"tertiary"}
                    >{__('Create a campaign', 'mailerpress')}</Button>
                </Flex>
            </CardHeader>
            <CardBody>
                <HStack>
                    <VStack spacing={2}>
                        <Text variant={"muted"}>
                            {
                                sprintf(
                                    __(`From the last %s days`, 'mailerpress'),
                                    period
                                )
                            }
                        </Text>
                    </VStack>

                    <ToggleGroupControl
                        value={period}
                        isAdaptiveWidth={true}
                        __nextHasNoMarginBottom
                        isBlock
                        onChange={setPeriod}
                    >
                        <ToggleGroupControlOption
                            label="7 days"
                            value="7"
                        />
                        <ToggleGroupControlOption
                            label="30 days"
                            value="30"
                        />
                        <ToggleGroupControlOption
                            label="60 days"
                            value="60"
                        />
                    </ToggleGroupControl>
                </HStack>
                <Divider margin={4}/>
                <VStack spacing={4} expanded={false}>
                    <LineCampaign/>
                    <LineCampaign/>
                    <LineCampaign/>
                </VStack>
            </CardBody>
        </div>
    )
}
export default LatestCampaigns