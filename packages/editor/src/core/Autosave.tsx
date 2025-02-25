import React, {useCallback, useEffect, useState} from "react";
import Block from "../interfaces/block.ts";
import {Spinner} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import {addQueryParamToUrl} from "../utils/function.ts";
import {IEmailConfig} from "../interfaces/block-editor-state.ts";
import {useToasts} from "../hooks/useToasts.ts";
import {debounce} from 'lodash';
import {__} from '@wordpress/i18n';

const DEBOUNCE_SAVE_DELAY_MS = 500;

interface AutosaveProps {
    data: Array<Block>,
    postEdit: string | null,
    emailConfig: IEmailConfig,
    onDone
}

const addCampaign = (json, emailConfig: IEmailConfig) => {
    const {campaignName, config, ...rest} = emailConfig

    return apiFetch({
        path: '/mailerpress/v1/campaigns',
        method: 'POST',
        data: {
            title: emailConfig?.config.campaignName,
            meta: {
                json,
                emailConfig: config
            }
        },
        headers: {
            'X-WP-Nonce': window.jsVars.nonce
        }
    })
}

const saveCampaign = (id, json, emailConfig: IEmailConfig) => {
    const {campaignName, config, ...rest} = emailConfig
    return apiFetch({
        path: `/mailerpress/v1/campaign/${id}`,
        method: 'PUT',
        headers: {
            'X-WP-Nonce': window.jsVars.nonce
        },
        data: {
            title: emailConfig?.campaignName,
            meta: {
                json,
                emailConfig: config,
            }
        },
    })
}

export default function Autosave({data, postEdit, emailConfig, onDone, setEmailConfig}: AutosaveProps) {
    const [isSaving, setIsSaving] = useState(false)
    const {pushToast} = useToasts()

    const saveExperimentData = useCallback(async (newExperimentData, newPostEdit) => {
        setIsSaving(true)
        if (null === newPostEdit) {
            const campaignId = await addCampaign(newExperimentData, emailConfig)
            setIsSaving(false)
            addQueryParamToUrl(
                window.location.href,
                {
                    'edit': campaignId
                }
            )
            setEmailConfig({...emailConfig, status: 'draft'})
        } else {
            saveCampaign(newPostEdit, newExperimentData, emailConfig)
                .then(() => setIsSaving(false))
                .catch(() => {
                    pushToast({
                        title: __('Error while saving the campaign', 'mailerpress'),
                        type: 'error',
                        duration: 5
                    })
                })
        }
    }, []);

    const debouncedSave = useCallback(
        debounce(async (newExperimentData: Array<Block>, newPostEdit) => {
            await saveExperimentData(newExperimentData, newPostEdit);
            onDone()
        }, DEBOUNCE_SAVE_DELAY_MS),
        []
    );

    // The magic useEffect hook. This runs only when `experimentData.name` changes.
    // We could add more properties, should we want to listen for their changes.
    useEffect(() => {
        if (data) {
            debouncedSave(data, postEdit);
        }
    }, [data, debouncedSave, postEdit]);

    // Do not display anything on the screen.
    return (
        isSaving && <div className="mailerpress-autosave">
            <Spinner/>
        </div>
    )
}
