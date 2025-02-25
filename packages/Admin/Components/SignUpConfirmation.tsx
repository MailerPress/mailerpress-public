import React from "react"
import {__} from "@wordpress/i18n";
import {
    __experimentalText as Text,
    __experimentalVStack as VStack, Button,
} from "@wordpress/components";
import {cloudUpload} from "@wordpress/icons";
import {t} from "../../editor/src/utils/function.ts";
import ComponentWrapper from "./ComponentWrapper.tsx";

const SignUpConfirmation = () => {
    const onSave = () => alert()

    return (
        <ComponentWrapper
            mainTitle={__('Sign-up Confirmation')}
            actions={[
                <Button
                    icon={cloudUpload}
                    onClick={onSave}
                    variant={"primary"}
                >{__('Save settings', 'mailerpress')}</Button>
            ]}
        >
            <VStack spacing={8}>
                <VStack spacing={1}>
                    <Text weight="700" size={20}>
                        {__('Enable sign-up confirmation', 'mailerpress')}
                    </Text>
                    <Text variant={"muted"}>
                        {__('If you enable this option, your subscribers will first receive a confirmation email after they subscribe. Once they confirm their subscription (via this email), they will be marked as \'confirmed\' and will begin to receive your email newsletters. Read more about Double Opt-in confirmation.', 'mailerpress')}
                    </Text>
                </VStack>
                <VStack spacing={1}>
                    <Text weight="700" size={20}>
                        {__('Confirmation page', 'mailerpress')}
                    </Text>
                    <Text variant={"muted"}>
                        {__('When subscribers click on the activation link, they will be redirected to this page.', 'mailerpress')}
                    </Text>
                </VStack>
            </VStack>
        </ComponentWrapper>
    )
}
export default SignUpConfirmation