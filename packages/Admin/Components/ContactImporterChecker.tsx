import React, {useState, useEffect, useRef, useMemo} from "react";
import axios from "axios";
import {__experimentalHStack as HStack, __experimentalText as Text} from "@wordpress/components";
import {t} from "../../editor/src/utils/function.ts";
import {ApiService} from "../../editor/src/core/apiService.ts";
import {useToasts} from "../../editor/src/hooks/useToasts.ts";

const ContactImporterChecker = () => {
    const [batches, setBatches] = useState(null);
    let total = 0;
    let processed = 0;
    let interval = null;
    const {pushToast} = useToasts();

    // Fetch batch data
    const fetchBatchData = () => {
        ApiService.getBatchImport().then(r => {
            if (r.length > 0) {
                r.forEach(d => {
                    total = parseInt(d.count);
                    processed = parseInt(d.processed_count)
                })

                setBatches({
                    total,
                    processed
                })
            } else {
                setBatches(null)
            }
        })
    }

    useEffect(() => {
        // Fetch data on component mount
        fetchBatchData()

        interval = setInterval(fetchBatchData, 1000);

        return () => clearInterval(interval);

    }, []);

    const percentage = useMemo(() => {
        if (batches) {
            return Math.round((batches.processed / batches.total) * 100)
        }
        return 0
    }, [batches]);

    useEffect(() => {
        if (percentage === 100) {
            pushToast({
                title: t('Your contact are imported'),
                type: 'success',
                duration: 5
            })
        }
    }, [percentage]);

    return (
        batches && total < 100 &&
        <HStack expanded={false} justify={"flex-start"}>
            <span className="loader"/>
            <Text variant={"muted"}>
                {t('An import is currently running -')}
            </Text>
            <Text weight={"bold"}>
                {percentage}%
            </Text>
        </HStack>
    )
}

export default ContactImporterChecker