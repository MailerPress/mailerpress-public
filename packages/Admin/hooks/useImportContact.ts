import {useState, useEffect, useRef} from "react";
import {ApiService} from "../../editor/src/core/apiService.ts";
import {useToasts} from "../../editor/src/hooks/useToasts.ts";
import {t} from "../../editor/src/utils/function.ts";

const useImportContact = () => {
    const {pushToast} = useToasts();
    const [progress, setProgress] = useState(0);
    const [isImporting, setIsImporting] = useState(false);
    const intervalRef = useRef(null);
    let total = 0;
    let processed = 0;
    const startImport = async (data) => {
        return ApiService.batchImportContacts({
            mapping: data.mapping,
            lists: data.lists,
            tags: data.tags,
            status: data.status,
            forceUpdate: data.forceUpdate
        }).then(() => intervalRef.current = setInterval(fetchProgress, 1000))
    };

    useEffect(() => {
        if (progress >= 100) {
            pushToast({
                title: t('Your contact are succesfully imported'),
                type: 'success',
                duration: 5
            })
            clearInterval(intervalRef.current);
            setIsImporting(false)
            setProgress(0)
        }
    }, [progress]);

    const fetchProgress = async () => {
        ApiService.getBatchImport().then(r => {
            if (r.length > 0) {
                r.forEach(d => {
                    total = parseInt(d.count);
                    processed = parseInt(d.processed_count)
                })
                setProgress(Math.round((processed / total) * 100))
            }
        })
    };

    // Clean up polling on unmount
    useEffect(() => {
        ApiService.getBatchImport().then(r => {
            if (r.length > 0) {
                clearInterval(intervalRef.current)
                r.forEach(d => {
                    total = parseInt(d.count);
                    processed = parseInt(d.processed_count)
                })
                setIsImporting(true);
                setProgress(Math.round((processed / total) * 100))
                intervalRef.current = setInterval(fetchProgress, 1000)
            }
        })

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        progress,
        isImporting,
        startImport,
        setIsImporting
    };
};

export default useImportContact;
