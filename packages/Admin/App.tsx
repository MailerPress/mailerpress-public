import React, {useMemo} from "react";
import WizardSetup from "../components/WizardSetup.tsx";
import Layout from "./Components/Layout.tsx";
import {StepperProvider} from "./context/StepsContext.tsx";
import {ToastContextProvider} from "../editor/src/context/Toast.tsx";
import {ImportContactProvider} from "./context/ImportContactContext.tsx";
import {ModalProvider, useModalContext} from "./context/ModalContext.tsx";
import {Modal} from "@wordpress/components";
import {URLProvider} from "./context/UrlContext.tsx";
import {NoticeWarningEspProvider} from "./context/NoticeWarningEsp.tsx";

const App = () => {

    const view = useMemo(() => {
        if (!jsVars.pluginInited) {
            return <WizardSetup/>
        } else {
            return <Layout/>
        }
    }, [])

    return (
        <div className={"mailerpress"}>
            <NoticeWarningEspProvider>
                <URLProvider>
                    <ToastContextProvider>
                        <ModalProvider>
                            <StepperProvider>
                                <ImportContactProvider>
                                    <View>
                                        {view}
                                    </View>
                                </ImportContactProvider>
                            </StepperProvider>
                        </ModalProvider>
                    </ToastContextProvider>
                </URLProvider>
            </NoticeWarningEspProvider>
        </div>
    )
}

const View = ({children}) => {
    const {visible, close, modal} = useModalContext();
    return (
        <>
            {
                visible && <Modal
                    shouldCloseOnClickOutside={false}
                    shouldCloseOnEsc={false}
                    __experimentalHideHeader={modal.hasHeader !== undefined || modal.hasHeader === false}
                    className={modal.className || ''}
                    title={modal.title}
                    size={modal.size || 'fill'}
                    onRequestClose={close}
                >
                    {modal.component}
                </Modal>
            }
            {children}
        </>
    )
}
export default App