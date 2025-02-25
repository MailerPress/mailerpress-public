import React, {useState} from "react"
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    __experimentalInputControl as InputControl,
    __experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
    Button, Flex, FlexItem, FlexBlock, SelectControl
} from "@wordpress/components";
import {t} from "../editor/src/utils/function.ts";
import {useToasts} from "../editor/src/hooks/useToasts.ts";
import {useModalContext} from "../Admin/context/ModalContext.tsx";
import {ApiService} from "../editor/src/core/apiService.ts";
import CustomSelect from "./CustomSelect.tsx";

type Inputs = {
    contactEmail: string
    contactFirstName: string,
    contactLastName: string,
    contactStatus: string,
    contactLists: string,
}

const AddContact = ({onReload}) => {
    const {pushToast} = useToasts();
    const {setModal} = useModalContext()
    const [error, setError] = useState(null)
    const [tags, setTags] = useState([])
    const [lists, setLists] = useState([])

    const {
        control,
        handleSubmit,
        watch,
        formState: {
            isValid
        }
    } = useForm<Inputs>({
        defaultValues: {
            contactEmail: '',
            contactFirstName: '',
            contactLastName: '',
            contactStatus: '',
            contactLists: ''
        },
    })

    const handleCreateOption = (newOption) => {
        ApiService
            .createTag(newOption)
            .then(res => {
                setOptions((prevOptions) => [...prevOptions, res])
                setTags((prevTags) => [...prevTags, res])
            })
    };

    const handleOptionSelect = (option) => {
        setTags([...tags, option])
    };

    const handleDeleteTag = (tag) => {
        setTags(tags.filter((t) => t.id !== tag.id))
    };

    const [optionLists, setOptionsList] = useState(
        window.jsVars.lists.reduce((acc, item) => {
            acc.push({
                id: parseInt(item.list_id),
                label: item.name
            })
            return acc;
        }, [])
    );

    const [options, setOptions] = useState(
        window.jsVars.contactTags.reduce((acc, item) => {
            acc.push({
                id: parseInt(item.tag_id),
                label: item.name
            })
            return acc;
        }, [])
    );

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        ApiService.createContact({
            ...data,
            tags,
            lists
        }).then(() => {
            onReload()
            setModal(null)
            pushToast({
                title: t('Contact created successfully'),
                status: 'success',
                duration: 5
            })
        }).catch((e) => {
            // Safely access the error message or provide a fallback
            const errorMessage = e?.response?.data?.message || e?.message || t('An unexpected error occurred');
            setError(errorMessage);
        });
    }

    return (
        <form style={{width: '100%'}} className="add-contact-form" onSubmit={handleSubmit(onSubmit)}>
            {error && <p style={{color: 'red', marginTop: '5px'}}>{error}</p>}
            <VStack spacing={4}>
                <Controller
                    name="contactEmail"
                    control={control}
                    rules={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email address',
                        },
                    }}
                    render={({field: {onChange, value, onBlur}, fieldState: {error}}) =>
                        <div>
                            <InputControl
                                placeholder={t('email@example.com')}
                                value={value}
                                label={t('Email')}
                                onValidate={onBlur}
                                onChange={onChange}
                            />
                            {error && <p style={{color: 'red', marginTop: '5px'}}>{error.message}</p>
                            }
                        </div>
                    }

                />

                <Flex align={"flex-start"}>
                    <FlexBlock>
                        <Controller
                            name="contactFirstName"
                            control={control}
                            render={({field: {onChange, value, onBlur}, fieldState: {error}}) =>
                                <div>
                                    <InputControl
                                        placeholder={t('John')}
                                        value={value}
                                        label={t('First name')}
                                        onChange={onChange}
                                    />
                                    {error && <p style={{color: 'red', marginTop: '5px'}}>{error.message}</p>
                                    }
                                </div>
                            }
                        />
                    </FlexBlock>
                    <FlexBlock>
                        <Controller
                            name="contactLastName"
                            control={control}
                            render={({field: {onChange, value, onBlur}, fieldState: {error}}) =>
                                <div>
                                    <InputControl
                                        placeholder={t('Doe')}
                                        value={value}
                                        label={t('Last name')}
                                        onChange={onChange}
                                    />
                                    {error && <p style={{color: 'red', marginTop: '5px'}}>{error.message}</p>
                                    }
                                </div>
                            }
                        />
                    </FlexBlock>
                </Flex>

                <Controller
                    name="contactStatus"
                    control={control}
                    rules={{
                        required: 'Email marketing status is required',
                    }}
                    render={({field: {onChange, value, onBlur}, fieldState: {error}}) =>
                        <div>
                            <SelectControl
                                value={value}
                                label={t('Select email marketing status')}
                                onChange={onChange}
                                options={[
                                    {label: t('Select a status'), value: ''},
                                    {label: t('Subscribed'), value: 'subscribed'},
                                    {label: t('Unsubscribed'), value: 'unsubscribed'},
                                    {label: t('Pending'), value: 'pending'},
                                ]}
                            />
                            {error && <p style={{color: 'red', marginTop: '5px'}}>{error.message}</p>
                            }
                        </div>
                    }
                />

                <Controller
                    name="contactLists"
                    control={control}
                    rules={{
                        required: 'Contact list(s) is required',
                    }}
                    render={({field: {onChange, value, onBlur}, fieldState: {error}}) =>
                        <div>
                            <CustomSelect
                                selection={lists}
                                label={t('Select or create list')}
                                initialOptions={optionLists}
                                onCreateOption={newOption => {
                                    ApiService
                                        .createNewList(newOption)
                                        .then(res => {
                                            setOptionsList((prevOptions) => [...prevOptions, res])
                                            setLists((prevTags) => [...prevTags, res])
                                            onChange(newOption)
                                        })
                                }}
                                onOptionSelect={(selectedOption) => {
                                    onChange(selectedOption);
                                    setLists([...lists, selectedOption])// You can still call your handler for additional logic
                                }}
                                onDelete={(list) => {
                                    // Update form value by removing the deleted option
                                    const updatedValue = lists.filter((t) => t.id !== list.id)
                                    onChange(updatedValue);
                                    setLists(updatedValue) // Perform delete logic, e.g., updating state
                                }}
                            />
                            {error && <p style={{color: 'red', marginTop: '5px'}}>{error.message}</p>
                            }
                        </div>
                    }
                />

                <Controller
                    name="contactStatus"
                    control={control}
                    render={({field: {onChange, value, onBlur}, fieldState: {error}}) =>
                        <div>
                            <CustomSelect
                                selection={tags}
                                label={t('Select or create tag')}
                                initialOptions={options}
                                onCreateOption={handleCreateOption}
                                onOptionSelect={handleOptionSelect}
                                onDelete={handleDeleteTag}
                            />
                        </div>
                    }
                />


                <div className={"sticky-footer"}>
                    <HStack justify={"center"}>
                        <Button
                            type={"submit"}
                            variant={"primary"}
                        >
                            {t('Create contact')}
                        </Button>
                    </HStack>
                </div>
            </VStack>
        </form>
    )
}
export default AddContact