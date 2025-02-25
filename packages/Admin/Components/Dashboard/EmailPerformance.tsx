import React, {useEffect, useState} from "react"
import {
    __experimentalDivider as Divider, __experimentalGrid as Grid,
    __experimentalHeading as Heading,
    __experimentalHStack as HStack,
    __experimentalText as Text,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalVStack as VStack,
    Card,
    CardBody,
    CardHeader
} from "@wordpress/components";
import {t} from "../../../editor/src/utils/function.ts";

const EmailPerformance = () => {

    const [period, setPeriod] = useState('7')

    return (
        <Card size={"xSmall"}>
            <CardHeader>
                <Heading level={4}>
                    {t('Email performance')}
                </Heading>
            </CardHeader>
            <CardBody>
                <HStack>
                    <VStack spacing={2}>
                        <Heading level={2}>100</Heading>
                        <Text variant={"muted"}>
                            {t(`Emails sent in the last ${period} days`)}
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
                <Grid
                    alignment="bottom"
                    columns={3}
                    gap={2}
                >
                    <div style={{background: '#f8f8f8', padding: 8, borderRadius: 6}}>
                        <Heading level={2}>
                            100%
                        </Heading>
                        <Text variant="muted">{t('Delivered')}</Text>
                    </div>
                    <div style={{background: '#f8f8f8', padding: 8, borderRadius: 6}}>
                        <Heading level={2}>
                            30%
                        </Heading>
                        <Text variant="muted">{t('Opened')}</Text>
                    </div>
                    <div style={{background: '#f8f8f8', padding: 8, borderRadius: 6}}>
                        <Heading level={2}>
                            5%
                        </Heading>
                        <Text variant="muted">{t('Unsubsribed')}</Text>
                    </div>
                </Grid>
            </CardBody>
        </Card>
    )
}
export default EmailPerformance