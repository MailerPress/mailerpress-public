import apiFetch from "@wordpress/api-fetch";
import {addQueryArgs} from '@wordpress/url';
import {omit} from "lodash";

export const Api = () => {
    const nonce = window.jsVars.nonce;
    apiFetch.use(apiFetch.createNonceMiddleware(nonce));

    return {
        instance: apiFetch,
    };
}

export class ApiService {


    public static createOption(name: string, value) {
        return apiFetch({
            path: '/mailerpress/v1/create-option',
            method: 'POST',
            data: {
                name,
                value
            },
        })
    }


    public static installFont(font) {
        return apiFetch({
            path: '/mailerpress/v1/fonts',
            method: 'POST',
            data: {
                font
            },
        })
    }


    public static deleteFont(font) {
        return apiFetch({
            path: '/mailerpress/v1/fonts',
            method: 'DELETE',
            data: {
                font
            },
        })
    }


    public static saveTheme(name: string) {
        return apiFetch({
            path: '/mailerpress/v1/save-theme',
            method: 'POST',
            data: {
                name
            },
        })
    }

    public static fetchCampaigns(query: Object): Promise<unknown> {
        const controller = typeof AbortController === 'undefined' ? undefined : new AbortController();
        return apiFetch({
            path: addQueryArgs(`/mailerpress/v1/campaigns`, query),
            signal: controller?.signal
        })
    }

    public static getCampaignById(id): Promise<unknown> {
        const controller = typeof AbortController === 'undefined' ? undefined : new AbortController();
        return apiFetch({
            path: addQueryArgs(`/mailerpress/v1/campaign/${id}`),
            signal: controller?.signal
        })
    }

    public static previewContactCampaign(data): Promise<unknown> {
        return apiFetch({
            path: '/mailerpress/v1/campaign/contact/preview',
            method: 'POST',
            data,
        })
    }

    public static fetchPosts(query: Object): Promise<unknown> {
        const controller = typeof AbortController === 'undefined' ? undefined : new AbortController();
        const order = query.order.split('/')
        const sanitzeQuery = omit(query, ['postType'])
        const queryParams = {
            ...sanitzeQuery,
            orderby: order[0],
            order: order[1],
            categories: [query.category]
        }
        return apiFetch({
            path: addQueryArgs(`/wp/v2/${query.postType}`, queryParams),
            signal: controller?.signal
        })
    }

    public static createCampaign(data): Promise<unknown> {
        return apiFetch({
            path: '/mailerpress/v1/campaigns',
            method: 'POST',
            data,
        })
    }

    public static deleteContact(ids): Promise<unknown> {
        return apiFetch({
            path: `/mailerpress/v1/contact`,
            method: 'DELETE',
            data: {
                ids
            }
        })
    }


    public static updateContactStatus(newStatus: string, selection): Promise<unknown> {
        return apiFetch({
            path: `/mailerpress/v1/contacts`,
            method: 'PUT',
            data: {
                newStatus,
                ids: selection.isAllOccurrence ? null : selection.selected
            }
        })
    }

    public static deleteAllContact(): Promise<unknown> {
        return apiFetch({
            path: `/mailerpress/v1/contact/all`,
            method: 'DELETE',
        })
    }

    public static deleteCampaign(ids): Promise<unknown> {
        return apiFetch({
            path: `/mailerpress/v1/campaign`,
            method: 'DELETE',
            data: {
                ids
            }
        })
    }

    public static deleteAllCampaign(): Promise<unknown> {
        return apiFetch({
            path: `/mailerpress/v1/campaign/all`,
            method: 'DELETE',
        })
    }

    public static savePattern(data): Promise<unknown> {
        return apiFetch({
            path: '/mailerpress/v1/pattern',
            method: 'POST',
            data,
        })
    }

    public static deletePattern(id): Promise<unknown> {
        return apiFetch({
            path: `/mailerpress/v1/pattern/${id}`,
            method: 'DELETE',
        })
    }

    public static saveTemplate(data): Promise<unknown> {
        return apiFetch({
            path: '/mailerpress/v1/template',
            method: 'POST',
            data,
        });
    }

    public static generateLiveHtml(html): Promise<unknown> {
        return apiFetch({
            path: '/mailerpress/v1/campaign/html',
            method: 'POST',
            data: {
                html: html
            },
        });
    }

    public static searchPost(data): Promise<unknown> {
        const queryParams = {
            ...data,
            per_page: 20

        }
        return apiFetch({
            path: addQueryArgs(`/mailerpress/v1/search`, queryParams),
        })
    }

    public static sendEmail(data) {
        return apiFetch({
            path: '/mailerpress/v1/campaign/html',
            method: 'POST',
            data,
        })
    }

    public static createContact(data) {
        return apiFetch({
            path: '/mailerpress/v1/contact',
            method: 'POST',
            data,
        });
    }

    public static findContactWithTags(tags, lists) {

        const queryParams = {
            tags: tags.join(','),
            lists: lists.join(',')
        }
        return apiFetch({
            path: addQueryArgs(`/mailerpress/v1/contacts`, queryParams),
        })

    }

    public static createBatch(contacts, post, htmlContent, config, scheduledAt, sendType) {
        return apiFetch({
            path: '/mailerpress/v1/campaign/create_batch',
            method: 'POST',
            data: {
                contacts,
                post,
                htmlContent,
                config,
                scheduledAt,
                sendType
            },
        });

    }

    public static pauseBatch(batchId) {
        return apiFetch({
            path: '/mailerpress/v1/campaign/pause_batch',
            method: 'POST',
            data: {
                batchId
            },
        });

    }

    public static resumeBatch(batchId) {
        return apiFetch({
            path: '/mailerpress/v1/campaign/resume_batch',
            method: 'POST',
            data: {
                batchId
            },
        });

    }

    public static createTag(tagName: string) {
        return apiFetch({
            path: '/mailerpress/v1/tags',
            method: 'POST',
            data: {
                name: tagName,
            },
        });
    }

    public static batchImportContacts(data) {
        return apiFetch({
            path: '/mailerpress/v1/contacts/import',
            method: 'POST',
            data: {
                data
            },
        });
    }

    public static getBatchImport() {
        return apiFetch({
            path: '/mailerpress/v1/contacts/bactches/pending',
            method: 'GET',
        });
    }

    public static insertContact(data) {
        return apiFetch({
            path: '/mailerpress/v1/contact/import',
            method: 'POST',
            data
        });
    }

    public static createNewList(name) {
        return apiFetch({
            path: '/mailerpress/v1/list',
            method: 'POST',
            data: {
                name
            }
        });
    }

}