import React, {useState, useEffect} from "react"
import ListingCampaigns from "../../components/ListingCampaigns.tsx";
import Sidebar from "./Sidebar.tsx";
import {
    __experimentalHStack as HStack,
    __experimentalSpacer as Spacer,
    __experimentalText as Text, Button,
    Notice
} from "@wordpress/components";
import {Icon, warning} from "@wordpress/icons";
import {t} from "../../editor/src/utils/function.ts";
import {useNoticeWarning} from "../context/NoticeWarningEsp.tsx";

const Layout = () => {

    const [view, setView] = useState(null)
    const [activeScreen, setActiveScreen] = useState()
    const {isError} = useNoticeWarning()


    const handleLoadScreen = (screen, index) => {
        setView(screen)
        setActiveScreen(index)
    }

    return (
        <>
            <div className="mailerpress__layout">
                <div className="mailerpress__layout__sidebar">
                    <Sidebar
                        onLoadScreen={handleLoadScreen}
                        activeScreen={activeScreen}
                    />
                </div>
                <div className="mailerpress__layout__canvas">
                    <div className="page-content">
                        {isError &&
                            <Notice isDismissible={false} status={"error"}>
                                <React.Fragment key=".0">
                                    <HStack expanded={false} justify={"flex-start"}>
                                        <div
                                            style={{
                                                fill: '#cc1718',
                                                display: 'flex',
                                            }}
                                        >
                                            <Icon icon={warning}/>
                                        </div>
                                        <Text weight="bold">
                                            {t('Your primary sending service is disabled.')}
                                        </Text>
                                    </HStack>
                                    <Text>
                                        {t('MailerPress will therefore not be able to send your emails correctly. Please activate your default sending email or choose another active primary service.')}
                                    </Text>
                                    <Spacer marginTop={1}/>
                                    <Button
                                        href={`${jsVars.adminUrl}?page=mailerpress%2Fcampaigns.php&path=%2Fhome%2Fsettings&activeView=Sending+services`}
                                        variant={"link"}>
                                        Go to sending options
                                    </Button>
                                </React.Fragment>
                            </Notice>
                        }
                        {view}
                    </div>
                </div>
            </div>
        </>
    )
}
export default Layout