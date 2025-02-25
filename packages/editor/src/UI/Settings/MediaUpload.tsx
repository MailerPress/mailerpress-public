import React, {useEffect, useState} from "react"
import {useMedia} from "../../hooks/useMedia.ts";
import {
    Button,
    Placeholder,
    __experimentalVStack as VStack,
    __experimentalHStack as HStack,
    __experimentalGrid as Grid,
    Notice,
    __experimentalInputControl as InputControl, RangeControl, SelectControl, Spinner
} from "@wordpress/components";
import {gallery, image, media, trash, upload} from "@wordpress/icons";
import {PLACEHOLDER_IMAGE, STORE_KEY} from "../../constants.ts";
import {useDispatch} from "@wordpress/data";
import SettingRow from "../SettingRow.tsx";
import {__} from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

export const AiImageGenerator = ({onSelectImage}) => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [prompt, setPrompt] = useState('')
    const [size, setSize] = useState('256x256')
    const [number, setNumber] = useState(1)
    const generateImage = async () => {
        setIsProcessing(true)
        setResult([
            'https://www.creativefabrica.com/wp-content/uploads/2022/10/10/Cloudy-Sky-Super-Realistic-Graphic-40959600-1.png',
            'https://cdn.icon-icons.com/icons2/2699/PNG/512/google_logo_icon_169090.png'
        ])
        setIsProcessing(false)
    }

    const uploadAndSelectImage = async (url) => {

        const result = await apiFetch({
            path: '/mailerpress/v1/upload-image',
            method: 'POST',
            data: {
                url
            }
        })

        if (typeof result === 'string') {
            onSelectImage(result)
        }
    }

    return (
        <VStack expanded={true} justify={"space-between"}>
            {error !== '' && <Notice status={"error"} isDismissible={false}>{error}</Notice>}
            <HStack alignment={"center"} expanded={true} spacing={6} justify={"center"}>
                <div style={{flex: 1}}>
                    <InputControl
                        help={"For the best results, be as precise as possible\n"}
                        value={prompt}
                        onChange={setPrompt}
                        label={"Describe your image"}
                    />
                </div>
                <div style={{flex: 1}}>
                    <RangeControl
                        style={{flex: 1}}
                        initialPosition={1}
                        value={number}
                        onChange={setNumber}
                        min={1}
                        max={3}
                        label={"How many images do you want?"}
                    />
                </div>
                <div style={{flex: 1}}>
                    <SelectControl
                        label={"Taille souhaité"}
                        value={size}
                        onChange={setSize}
                        options={[
                            {label: "256x256", value: "256x256"},
                            {label: "512x512", value: "512x512"},
                            {label: "1024x1024", value: "1024x1024"},
                        ]}
                    />
                </div>
                {isProcessing && <Spinner/>}
                {!isProcessing &&
                    <Button disabled={prompt === ''} onClick={generateImage} variant={"primary"}>Generate</Button>}
            </HStack>
            {result === null && <Placeholder
                style={{height: 480, marginTop: 10}}
                withIllustration={true}
            />}
            {result !== null && <Grid style={{marginTop: 20}} isInline alignment={"bottom"} columns={7}>
                {result.map(img => <VStack alignment={"center"}>
                    <img style={{maxWidth: 200}} src={img} alt=""/>
                    <Button
                        onClick={() => uploadAndSelectImage(img)}
                        icon={upload}
                        variant={"primary"}
                    >Select this image</Button>
                </VStack>)}
            </Grid>
            }
        </VStack>
    )
}

export const MediaUpload = (props) => {
    const {onChange, val, setData, block} = props

    const [value, setValue] = useState(PLACEHOLDER_IMAGE)
    const {open, state} = useMedia();
    const {setModal} = useDispatch(STORE_KEY)

    useEffect(() => {
        if (state !== null) {
            setData({width: 300})
            onChange(state.url)
        }
    }, [state]);

    useEffect(() => {
        setValue(block.attributes.src)
    }, [block.attributes]);

    const onSelect = val => {
        setModal(null)
        onChange(val)
    }

    const openAiModal = () => {
        setModal({
            title: 'Generate image with AI',
            component: jsVars.gptAi !== '' ? <AiImageGenerator onSelectImage={onSelect}/> : <Notice
                status={"warning"}
                isDismissible={false}
                actions={[
                    {
                        label: __('Before using AI you must add your API key in the options TAB','mailerpress'),
                        variant: 'secondary',
                        url: `${jsVars.adminUrl}?page=mailerpress/campaigns.php&activeTab=3`
                    }
                ]}
            />
        })
    }

    return (
        <SettingRow>
            <Placeholder
                style={{padding: 12, boxShadow: 'inset 0 0 0 1px #e0e0e0'}}
                icon={image}
                label="Image"
            >
                <VStack>
                    {
                        block.attributes.src !== PLACEHOLDER_IMAGE &&
                        <div style={{aspectRatio: "4/3", display: "flex"}}>
                            <img src={block.attributes.src} style={{width: '100%', objectFit: 'contain'}}/>
                        </div>
                    }
                    <Button icon={gallery} variant={"primary"} onClick={open}>
                        {__('Open media library','mailerpress')}
                    </Button>
                    <Button icon={media} variant={"tertiary"} onClick={openAiModal}>
                        {__('Generate with AI','mailerpress')}

                    </Button>
                    {
                        value !== PLACEHOLDER_IMAGE &&
                        <Button icon={trash} isDestructive onClick={() => onChange('')}>
                            {__('Remove','mailerpress')}
                        </Button>
                    }
                </VStack>
            </Placeholder>
        </SettingRow>
    )
}