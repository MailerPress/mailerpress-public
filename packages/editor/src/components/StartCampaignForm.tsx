import {useForm, SubmitHandler, Controller} from "react-hook-form"
import {
    __experimentalHeading as Heading,
    Button,
    __experimentalHStack as HStack,
    __experimentalText as Text,
    __experimentalInputControl as InputControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    Flex, FlexItem, SelectControl, DateTimePicker, FlexBlock,
} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import {useDispatch} from "@wordpress/data";
import {STORE_KEY} from "../constants.ts";
import {useEffect, useRef} from "react";

export type Inputs = {
    campaignName: string
    campaignSubject: string,
    campaignList: string,
    sendChoice: string,
    sendAt: null | Date
}
const StartCampaignForm = () => {
    const {setEmailConfig} = useDispatch(STORE_KEY)
    const campaignNameRef = useRef<HTMLInputElement | null>(null);
    const {
        control,
        handleSubmit,
        watch,
        formState: {
            isValid
        }
    } = useForm<Inputs>({
        defaultValues: {
            campaignList: '',
            email_type: 'html',
            sendChoice: 'now',
            sendAt: new Date()
        },
    })

    useEffect(() => {
        if (campaignNameRef.current) {
            campaignNameRef.current.focus();
        }
    }, []);

    const sendChoice = watch('sendChoice');
    const onSubmit: SubmitHandler<Inputs> = (data) => setEmailConfig({
        config: data,
        status: 'draft',
        hasBatch: ''
    })

    const lists = () => {
        const empty = [{
            label: 'Select',
            value: ''
        }]

        const espList = jsVars.lists.reduce((acc, item) => {
            acc.push({
                label: item.name,
                value: item.list_id
            })
            return acc;
        }, [])

        return [
            ...empty,
            ...espList
        ];
    }

    return (
        <form className="start-campaign-form" onSubmit={handleSubmit(onSubmit)}>
            <section data-step={1}>
                <Heading level={3}>{__('About this campaign', 'mailerpress')}</Heading>
                <Text variant={"muted"}>{__('Campaign details', 'mailerpress')}</Text>
                <Flex expanded={false} justify={"flex-start"} direction={"column"}>
                    <FlexItem>
                        <Controller
                            name="campaignName"
                            control={control}
                            rules={{required: true}}
                            render={({field: {onChange, value}}) => <InputControl
                                value={value}
                                help={"Le nom de la campagne n’est visible que depuis l’interface d’administration de WordPress.\n"}
                                label={'Campaign name *'}
                                onChange={onChange}
                                ref={campaignNameRef}

                            />}
                        />

                    </FlexItem>

                    <FlexBlock>
                        <FlexItem>
                            <Controller
                                name="campaignSubject"
                                control={control}
                                rules={{required: true}}
                                render={({field: {onChange, value}}) => <InputControl
                                    value={value}
                                    help={"Ce texte sera affiché dans le titre de l’e-mail que recevront vos destinataires.\n"}
                                    label={'Campaign subject *'}
                                    onChange={onChange}
                                />}
                            />

                        </FlexItem>
                        <FlexItem>
                            <Controller
                                name="email_type"
                                control={control}
                                rules={{required: true}}
                                render={({field: {onChange, value}}) =>
                                    <SelectControl
                                        value={value}
                                        onChange={onChange}
                                        label={'Email type *'}
                                        options={[
                                            {label: 'HTML', value: 'html'},
                                            {label: 'Text', value: 'text'},
                                        ]}
                                    />
                                }
                            />
                        </FlexItem>
                    </FlexBlock>
                </Flex>

            </section>

            <section data-step={2}>
                <Heading level={3}>{__('Which list should we send this email to?', 'mailerpress')}</Heading>
                <Text variant={"muted"}>{__('Choose the recipients', 'mailerpress')}</Text>
                <Flex expanded={false} justify={"flex-start"} direction={"column"}>
                    <Controller
                        name="campaignList"
                        control={control}
                        rules={{required: true}}
                        render={({field: {onChange, value}}) => <SelectControl
                            value={value}
                            onChange={onChange}
                            label={'List *'}
                            options={lists()}
                        />}
                    />

                </Flex>
            </section>

            <section data-step={3}>
                <Heading level={3}>{__('When should we send this campaign?', 'mailerpress')}</Heading>
                <Text variant={"muted"}>{__('Don\'t worry, nothing will be sent until your email is finalized.', 'mailerpress')}</Text>
                <Flex expanded={false} justify={"flex-start"} direction={"column"}>

                    {
                        sendChoice === 'future' &&
                        <div style={{width: "33.333%"}}>
                            <Controller
                                name="sendAt"
                                control={control}
                                rules={{required: true}}
                                render={({field: {onChange, value}}) =>
                                    <DateTimePicker
                                        currentDate={value}
                                        onChange={onChange}
                                    />
                                }
                            />
                        </div>
                    }
                    <Controller
                        name="sendChoice"
                        control={control}
                        rules={{required: true}}
                        render={({field: {onChange, value}}) => <ToggleGroupControl
                            __nextHasNoMarginBottom
                            isBlock
                            value={value}
                            onChange={onChange}
                        >
                            <ToggleGroupControlOption
                                label={__('Send immediately', 'mailerpress')}
                                value="now"
                            />
                            <ToggleGroupControlOption
                                label={__('Later', 'mailerpress')}
                                value="future"
                            />
                            <ToggleGroupControlOption
                                label={__('Manually', 'mailerpress')}
                                value="manually"
                            />
                        </ToggleGroupControl>}
                    />
                </Flex>
            </section>

            <div className={"sticky-footer"}>
                <HStack justify={"center"}>
                    <Button disabled={!isValid} type={"submit"}
                            variant={"primary"}>{__('Start composing email', 'mailerpress')}</Button>
                </HStack>
            </div>

        </form>
    )
}
export default StartCampaignForm