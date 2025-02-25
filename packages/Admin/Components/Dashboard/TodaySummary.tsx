import React, {useCallback, useMemo, useState} from "react"
import {
    DatePicker,
    __experimentalText as Text,
    __experimentalVStack as VStack,
    __experimentalDivider as Divider, Notice
} from "@wordpress/components";
import {t} from "../../../editor/src/utils/function.ts";
import {LineCampaign} from "./LatestCampaigns.tsx";
import dayjs from "dayjs";

const TodaySummary = () => {

    const [date, setDate] = useState(Date.now)

    const dateDisplay = useMemo(() => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);

        // Calculer la différence en jours
        const differenceInDays = (inputDate - today) / (1000 * 60 * 60 * 24);

        if (differenceInDays === 0) {
            return "today";
        } else if (differenceInDays === 1) {
            return "tomorrow";
        } else if (differenceInDays === -1) {
            return "yesterday";
        } else {
            return dayjs(date).format('D MMMM YYYY');
        }
    }, [date]);

    return (
        <div className="widget-summary-today">
            <div className="widget-summary-today__calendar">
                <DatePicker
                    value={date}
                    onChange={setDate}/>
            </div>

            <div className="widget-summary-today__resume">
                <VStack>
                    <Text weight="600" size={20}>
                        {t(`Scheduled for ${dateDisplay}`)}
                    </Text>
                    <Divider marginEnd={0} marginStart={3}/>
                    {dateDisplay !== 'today' &&
                        <Text align={"center"} weight="normal" size={16} variant={"muted"}>
                            {t(`Nothing planned for ${dateDisplay}`)}
                        </Text>
                    }

                    {/*<Notice status={"warning"} isDismissible={false}>*/}
                    {/*    {t('Nothing planned for today')}*/}
                    {/*</Notice>*/}

                    {dateDisplay === 'today' && <>
                        <LineCampaign/>
                        <LineCampaign/>
                        <LineCampaign/>
                        <LineCampaign/>
                        <LineCampaign/>
                        <LineCampaign/>
                    </>
                    }
                </VStack>
            </div>
        </div>
    )
}
export default TodaySummary