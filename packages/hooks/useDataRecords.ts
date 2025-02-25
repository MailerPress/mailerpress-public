import React, {useEffect, useRef, useState} from "react"
import {useEntityRecords} from "@wordpress/core-data";
import apiFetch from "@wordpress/api-fetch";
import {addQueryArgs} from "@wordpress/url";

const useDataRecords = (endpoint: string, queryArgs: Record<string, unknown>) => {
    const [records, setRecords] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const onReload = () => {
        const controller = typeof AbortController === 'undefined' ? undefined : new AbortController();
        const fetchData = async () => {
            setIsLoading(true)
            const result = await apiFetch({
                path: addQueryArgs(`${window.jsVars.endpointBase}${endpoint}`, queryArgs),
                signal: controller?.signal
            })

            return result
        }

        fetchData().then(data => {
            setIsLoading(false)
            setRecords(data)
        })
    }

    useEffect(() => {
        const controller = typeof AbortController === 'undefined' ? undefined : new AbortController();

        const fetchData = async () => {
            setIsLoading(true)
            const result = await apiFetch({
                path: addQueryArgs(`${window.jsVars.endpointBase}${endpoint}`, queryArgs),
                signal: controller?.signal,
                headers: {'X-WP-Nonce': window.jsVars.nonce}
            })

            return result
        }

        fetchData().then(data => {
            setIsLoading(false)
            setRecords(data)
        })

    }, [queryArgs]);

    return {
        records,
        isLoading,
        onReload,
        setRecords
    }
}
export default useDataRecords