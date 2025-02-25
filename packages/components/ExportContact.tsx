import React from "react"
import {
    __experimentalHStack as HStack,
    Button,
    __experimentalHeading as Heading
} from "@wordpress/components";
import {useToasts} from "../editor/src/hooks/useToasts.ts";
import {useModalContext} from "../Admin/context/ModalContext.tsx";
import {close} from "@wordpress/icons";
import {__} from '@wordpress/i18n';

type Inputs = {}

const ExportContact = ({closeModal}) => {
    const {pushToast} = useToasts();
    const {setModal} = useModalContext()

    return (
        <>
            <HStack expanded={true} justify="space-between">
                <Heading level={3}>
                    {__('Export Contacts', 'mailerpress')}
                </Heading>
                <Button icon={close} onClick={closeModal}/>
            </HStack>
        </>
    );
}
export default ExportContact