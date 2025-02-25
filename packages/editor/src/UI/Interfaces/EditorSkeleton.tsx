import {cog as cogIcon, drawerRight} from "@wordpress/icons";
import React, {PropsWithChildren, ReactNode, useEffect, useState,} from "react";
import {ToolbarButton, Notice} from '@wordpress/components'
import {useSelect, dispatch} from "@wordpress/data";
import {AnimatePresence, useReducedMotion} from "motion/react"
import {__} from "@wordpress/i18n";
import * as motion from "motion/react-client"
import {STORE_KEY} from "../../constants.ts";

export interface HeaderConfig {
    left?: React.ReactNode;
    middle?: React.ReactNode;
    right?: React.ReactNode;
}

type type = {
    header?: HeaderConfig,
    hasLeftSidebar?: boolean,
    sidebarOpen?: boolean,
    toggleSidebar?: Function
    content: ReactNode,
    sidebar: ReactNode,
    leftArea: ReactNode,
    isEditable?: boolean
};

const EditorSkeleton = (props: PropsWithChildren<type>) => {

    const [hasLoaded, setHasLoaded] = useState(false);
    const disableMotion = useReducedMotion()

    useEffect(() => {
        setHasLoaded(true); // Set true after the first render
    }, []);

    const {blockSidebarOpen, secondarySidebarOpen} = useSelect(select => {
        return {
            blockSidebarOpen: select(STORE_KEY).blockSidebarOpen(),
            secondarySidebarOpen: select(STORE_KEY).secondarySidebarOpen(),
        }
    }, [])

    const ANIMATION_DURATION = 0.25;
    const defaultTransition = {
        type: 'tween',
        duration: disableMotion ? 0 : ANIMATION_DURATION,
        ease: [0.6, 0, 0.4, 1],
    };

    return (
        <div className="block-editor-container">
            <div className="block-editor">
                <div
                    className="block-editor__header"
                    role="region"
                >
                    <div className="left-side">
                        <a href={`${jsVars.adminUrl}?page=mailerpress/campaigns.php&path=/home`}
                           className="return-button">
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1058.1 873.9">
                                <path fill="currentColor" className="st0"
                                      d="M318.3,387.8c0,0-.1,0-.2,0-.6,0-1,.5-1,1h0c1.3,97.6,1.9,195.2,1.9,293,0,32,4.1,53.2,30.9,66.7,5.9,3,16.3,4.4,31.1,4.3,180.3-1,346.3-.9,497.9.4,45.7.4,68.5-22.9,68.5-69.9-.2-53.1-.5-214.8-.8-485.1,0-20.9-1.3-34.2-3.9-39.8-5.7-12.2-13.6-22-23.8-29.1-7-4.9-18.7-7.4-35.1-7.4-238.5,0-476.9.1-715.4,0-22,0-38.1,8-48.2,24-5.9,9.5-8.8,24.4-8.6,44.9,1.1,155.7,2.3,306.3,3.4,451.8,0,2.4-1.7,4.4-4.1,4.8-26.1,4.2-50.4,4.4-72.6-12.2C12.8,616,.1,589.6.1,556.1,0,326.3,0,197.4,0,169.3-.1,109.9,24,63.4,72.5,29.7,108,5,138.2,0,184.8,0c308.2.2,538.6.2,691.1.2,79.2,0,135.8,36,169.7,108,6.7,14.1,10,30.9,10.1,50.4,1.2,272.6,2,454.1,2.5,544.6.3,50.8-19.7,93.6-60.1,128.2-37.5,32.1-71.8,41.9-124.4,42-30.3,0-184.9.3-463.8.5-46.4,0-76.6-2.4-90.6-7.5-51.1-18.2-96.6-67-106.2-122.3-1-5.9-1.6-28.3-1.7-67.1-.8-159.7-.8-310.1,0-451.1,0-3.1,1.6-4.7,4.7-4.7h97.4c4.2,0,8.2,1.8,11,4.9l202.7,224.4c0,0,.1.1.2.2,2.3,2.3,6.1,2.3,8.4,0,0,0,.1-.1.2-.2l200-221.6c4.2-4.6,10.1-7.2,16.2-7.2h85.9c2.4,0,4.4,2,4.4,4.4v415.6c0,1.7-.8,2.6-2.5,2.6h-97.9c-1.6,0-3-1.3-3-3v-247.9c0-5.8-1.9-6.5-5.6-2.1l-197.3,227.6c-.8,1-2,1.5-3.3,1.5s-2.2-.5-3-1.3c-71.8-71-136.2-147.4-207.5-229-1.2-1.3-2.5-2.1-3.9-2.4Z"></path>
                            </svg>
                        </a>
                        {props.header && props.header.left &&
                        React.isValidElement(props.header.left) ?
                            React.cloneElement(props.header.left, props) :
                            null
                        }
                    </div>
                    <div className="middle-side">
                        {props.header && props.header.middle &&
                        React.isValidElement(props.header.middle) ?
                            React.cloneElement(props.header.middle, props) :
                            null
                        }
                    </div>
                    <div className="right-side">
                        {props.header && props.header.right &&
                        React.isValidElement(props.header.right) ?
                            React.cloneElement(props.header.right, props) :
                            null
                        }
                        {(props.isEditable === undefined || props.isEditable) &&
                            <ToolbarButton
                                size={'compact'}
                                icon={drawerRight}
                                onClick={() => dispatch(STORE_KEY).toggleSecondarySidebar()}
                                isPressed={secondarySidebarOpen}
                                label={'Settings'}
                            />
                        }
                    </div>
                </div>
                {props.isEditable !== undefined && !props.isEditable &&
                    <Notice
                        className="mailerpress-notice-actions"
                        status={"error"}
                        onDismiss={() => {
                            window.location.href = `${jsVars.adminUrl}?page=mailerpress/campaigns.php&path=/home/campaigns`
                        }}
                    >
                        {__('This campaign is no longer editable as it has already been sent.','mailerpress')}
                    </Notice>
                }
                <div
                    className="block-editor__content"
                >
                    <AnimatePresence mode="wait">
                        {blockSidebarOpen && props.hasLeftSidebar && (props.isEditable === undefined || props.isEditable) && (
                            <motion.div
                                className="block-editor__sidebar"
                                role="region"
                                initial={hasLoaded ? {x: -300, width: 0, opacity: 0} : false}
                                animate={{x: 0, width: 300, opacity: 1}}
                                exit={{x: -300, width: 0, opacity: 0}}
                                transition={defaultTransition}
                            >
                                {React.isValidElement(props.leftArea) ? React.cloneElement(props.leftArea, props) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>


                    <div style={{flex: 1}}>
                        {React.isValidElement(props.content) ? React.cloneElement(props.content, props) : null}
                    </div>

                    <AnimatePresence mode="wait">
                        {secondarySidebarOpen && (props.isEditable === undefined || props.isEditable) && (
                            <motion.div
                                className="block-editor__sidebar"
                                role="region"
                                initial={hasLoaded ? {x: 300, width: 0, opacity: 0} : false}
                                animate={{x: 0, width: 300, opacity: 1}}
                                exit={{x: 300, width: 0, opacity: 0}}
                                transition={defaultTransition}
                            >
                                {React.isValidElement(props.sidebar) ? React.cloneElement(props.sidebar, props) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
        ;
};

export default EditorSkeleton