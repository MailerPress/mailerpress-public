import React, {useEffect, useState} from "react"
import {
    __experimentalHeading as Heading,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    __experimentalGrid as Grid,
    __experimentalVStack as VStack,
    __experimentalText as Text,
    __experimentalDivider as Divider,
    __experimentalHStack as HStack,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import {t} from "../../../editor/src/utils/function.ts";
import {external} from "@wordpress/icons";

const ContactsSummary = () => {
    const [period, setPeriod] = useState('7')

    return (
        <Card size={"xSmall"}>
            <CardHeader>
                <Flex align={"center"} justify={"space-between"}>
                    <Heading level={4}>
                        {t('Contacts')}
                    </Heading>
                    <Button
                        icon={external}
                        variant={"tertiary"}
                    >{t('Add new contact')}</Button>
                </Flex>
            </CardHeader>
            <CardBody>
                <HStack>
                    <VStack spacing={2}>
                        <Text variant={"muted"}>
                            {t(`From the last ${period} days`)}
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
                <Grid columns={3}>
                    <VStack spacing={1}>
                        <div style={{background: '#f8f8f8', padding: 8, borderRadius: 6}}>
                            <Heading level={2}>
                                25
                            </Heading>
                            <Text variant="muted">{t(`contacts in the last ${period} days`)}</Text>
                        </div>
                    </VStack>
                    <VStack spacing={1}>
                        <div style={{background: '#f8f8f8', padding: 8, borderRadius: 6}}>
                            <Heading level={2}>
                                + 30
                            </Heading>
                            <Text variant="muted">{t(`contacts in the last ${period} days`)}</Text>
                        </div>
                    </VStack>
                    <VStack spacing={1}>
                        <div style={{background: '#f8f8f8', padding: 8, borderRadius: 6}}>
                            <Heading level={2}>
                                - 5
                            </Heading>
                            <Text variant="muted">{t(`contacts in the last ${period} days`)}</Text>
                        </div>
                    </VStack>
                </Grid>
            </CardBody>
        </Card>
    )
}
export default ContactsSummary