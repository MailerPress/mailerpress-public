import React, {useContext, useReducer, useState} from "react"
import {__} from '@wordpress/i18n';
import {
    Button,
    __experimentalText as Text,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    __experimentalHeading as Heading,
    __experimentalInputControl as InputControl,
    Flex,
    FlexItem
} from "@wordpress/components";
import {arrowLeft, arrowRight, wordpress, home, drafts} from "@wordpress/icons";
import {t} from "../editor/src/utils/function.ts";
import SendingConf from "../Admin/Components/Screens/SendingConf.tsx";
import {useNoticeWarning} from "../Admin/context/NoticeWarningEsp.tsx";
import {ApiService} from "../editor/src/core/apiService.ts";

function reducer(state, action) {
    switch (action.type) {
        case 'nextStep': {
            return {
                ...state,
                step: state.step + 1
            };
        }
        case 'prevStep': {
            return {
                ...state,
                step: state.step - 1
            };
        }
        case 'selectedProvider': {
            return {
                ...state,
                config: {
                    ...state.config,
                    selectedProvider: action.value
                }
            };
        }
        case 'SET_API_KEY': {
            return {
                ...state,
                config: {
                    ...state.config,
                    apiKey: action.value
                }
            };
        }
    }
    throw Error('Unknown action: ' + action.type);
}

const Setup = ({state, dispatch}) => {
    const {setData, data} = useNoticeWarning()

    const [senderData, setSenderData] = useState({
        fromName: window.jsVars.sender ? JSON.parse(window.jsVars.sender).fromName : '',
        fromAddress: window.jsVars.sender ? JSON.parse(window.jsVars.sender).fromAddress : ''
    })

    console.log(data)

    const handleSaveStep1 = () => {
        ApiService
            .createOption('mailerpress_global_email_senders', senderData)
            .then(() => dispatch({type: 'nextStep'}))
    }

    return (
        <div className="wizard-component__content">
            <Flex>
                <HStack spacing={3} expanded={false} justify={"flex-start"} alignment="center">
                    <div>
                        <svg style={{width: 30, pointerEvents: 'none'}} xmlns="http://www.w3.org/2000/svg"
                             version="1.1"
                             viewBox="0 0 1058.1 873.9">
                            <path fill="currentColor" className="st0"
                                  d="M318.3,387.8c0,0-.1,0-.2,0-.6,0-1,.5-1,1h0c1.3,97.6,1.9,195.2,1.9,293,0,32,4.1,53.2,30.9,66.7,5.9,3,16.3,4.4,31.1,4.3,180.3-1,346.3-.9,497.9.4,45.7.4,68.5-22.9,68.5-69.9-.2-53.1-.5-214.8-.8-485.1,0-20.9-1.3-34.2-3.9-39.8-5.7-12.2-13.6-22-23.8-29.1-7-4.9-18.7-7.4-35.1-7.4-238.5,0-476.9.1-715.4,0-22,0-38.1,8-48.2,24-5.9,9.5-8.8,24.4-8.6,44.9,1.1,155.7,2.3,306.3,3.4,451.8,0,2.4-1.7,4.4-4.1,4.8-26.1,4.2-50.4,4.4-72.6-12.2C12.8,616,.1,589.6.1,556.1,0,326.3,0,197.4,0,169.3-.1,109.9,24,63.4,72.5,29.7,108,5,138.2,0,184.8,0c308.2.2,538.6.2,691.1.2,79.2,0,135.8,36,169.7,108,6.7,14.1,10,30.9,10.1,50.4,1.2,272.6,2,454.1,2.5,544.6.3,50.8-19.7,93.6-60.1,128.2-37.5,32.1-71.8,41.9-124.4,42-30.3,0-184.9.3-463.8.5-46.4,0-76.6-2.4-90.6-7.5-51.1-18.2-96.6-67-106.2-122.3-1-5.9-1.6-28.3-1.7-67.1-.8-159.7-.8-310.1,0-451.1,0-3.1,1.6-4.7,4.7-4.7h97.4c4.2,0,8.2,1.8,11,4.9l202.7,224.4c0,0,.1.1.2.2,2.3,2.3,6.1,2.3,8.4,0,0,0,.1-.1.2-.2l200-221.6c4.2-4.6,10.1-7.2,16.2-7.2h85.9c2.4,0,4.4,2,4.4,4.4v415.6c0,1.7-.8,2.6-2.5,2.6h-97.9c-1.6,0-3-1.3-3-3v-247.9c0-5.8-1.9-6.5-5.6-2.1l-197.3,227.6c-.8,1-2,1.5-3.3,1.5s-2.2-.5-3-1.3c-71.8-71-136.2-147.4-207.5-229-1.2-1.3-2.5-2.1-3.9-2.4Z"/>
                        </svg>
                    </div>
                    <div>
                        <Heading level={4}>
                            MailerPress
                        </Heading>
                        <Text variant={"muted"}>
                            {__('Before using mailerpress, please setup the plugin', 'mailerpress')}
                        </Text>
                    </div>
                </HStack>
                <FlexItem>
                    <Button icon={wordpress} href={jsVars.adminUrl.replace('/admin.php', '')} variant={"tertiary"}>
                        {__('Exit', 'mailerpress')}
                    </Button>
                </FlexItem>
            </Flex>
            {state.step === 1 &&
                <div className="wizard-component-container">
                    <VStack expanded={true} justify={"center"}>
                        <Heading>
                            {
                                __('Start by configuring your sender information', 'mailerpress')
                            }
                        </Heading>
                        <VStack style={{marginTop: 24}} spacing={2}>
                            <Heading level={4}>
                                {__('Default sender', 'mailerpress')}
                            </Heading>
                            <Text>
                                {__('Enter details of the person or brand your subscribers expect to receive emails from', 'mailerpress')}
                            </Text>
                            <Flex style={{marginTop: 32}} direction={"column"} spacing={3}>
                                <InputControl
                                    value={senderData.fromName}
                                    onChange={fromName => setSenderData({...senderData, fromName})}
                                    label={__('From Name', 'mailerpress')}
                                />
                                <InputControl
                                    value={senderData.fromAddress}
                                    onChange={fromAddress => setSenderData({...senderData, fromAddress})}
                                    label={__('From Address', 'mailerpress')}
                                />
                            </Flex>
                        </VStack>
                    </VStack>
                    <div className="footer">
                        <Button
                            disabled={senderData.fromAddress === '' || senderData.fromName === ''}
                            onClick={handleSaveStep1}
                            icon={arrowRight}
                            variant={"primary"}

                        >
                            {__('Validate and move on to the next step', 'mailerpress')}
                        </Button>
                    </div>
                </div>
            }
            {state.step === 2 &&
                <div className="wizard-component-container">
                    <VStack style={{marginTop: 40}} expanded={true} justify={"flex-start"}>
                        <Heading>
                            {__('Please select your Email Service Provider', 'mailerpress')}
                        </Heading>
                        <div className="grid-container">
                            <SendingConf

                            />
                        </div>
                    </VStack>
                    <HStack className="footer">
                        <Button
                            onClick={() => dispatch({type: 'prevStep'})}
                            icon={arrowLeft}
                            variant={"tertiary"}
                        >
                            {__('Return to previous step', 'mailerpress')}
                        </Button>
                        <Button
                            disabled={
                                false === Object.keys(data.services).some(service => data.activated.includes(service)) ||
                                (data.default_service === null || data.default_service === undefined) ||
                                undefined === data.services[data.default_service]
                            }
                            onClick={() => dispatch({type: 'nextStep'})}
                            icon={arrowRight}
                            variant={"primary"}
                        >
                            {__('Validate and move on to the next step', 'mailerpress')}
                        </Button>
                    </HStack>
                </div>
            }
            {state.step === 3 &&
                <div className="wizard-component-container">
                    <Heading>
                        {__('You are all set !', 'mailerpress')}
                    </Heading>
                    <Text variant={"muted"}>
                        {__('You can now create and send your newsletter thanks with MailerPress', 'mailerpress')}
                    </Text>
                    <div style={{width: 500, margin: "20px auto"}}>
                        <div className="success-checkmark">
                            <div className="check-icon">
                                <span className="icon-line line-tip"></span>
                                <span className="icon-line line-long"></span>
                                <div className="icon-circle"></div>
                                <div className="icon-fix"></div>
                            </div>
                        </div>
                    </div>
                    <HStack expanded={false} alignment={"center"}>
                        <Button
                            variant={"tertiary"}
                            icon={drafts}
                            href={`${jsVars.adminUrl}?page=mailerpress/new`}
                        >
                            {__('Create your first campaign', 'mailerpress')}
                        </Button>
                        <Button
                            variant={"tertiary"}
                            icon={home}
                            href={`${jsVars.adminUrl}?page=mailerpress/campaigns.php`}
                        >
                            {__('Go to home', 'mailerpress')}
                        </Button>
                    </HStack>
                </div>
            }
        </div>
    )
}

const Progress = ({progress}) => {
    return <div className="wizard-component__progress">
        <div className="wizard-component__progress__bar" style={{width: `${progress}%`}}></div>
    </div>
}

const WizardSetup = () => {
    const [state, dispatch] = useReducer(
        reducer,
        {
            step: 1,
            numberStep: 3,
            config: {
                selectedProvider: null,
                apiKey: null
            }
        }
    );

    return (
        <div className="wizard-component">
            <Progress progress={(state.step * 100) / state.numberStep}/>
            <Setup
                state={state}
                dispatch={dispatch}
            />
        </div>
    )
}
export default WizardSetup