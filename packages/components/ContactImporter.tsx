import React, {useEffect, useMemo, useReducer, useState} from 'react'
import {
    DropZone,
    __experimentalText as Text,
    __experimentalVStack as VStack,
    __experimentalHStack as HStack,
    __experimentalHeading as Heading,
    __experimentalSpacer as Spacer,
    SelectControl, Button, Modal,
    Flex, CheckboxControl
} from "@wordpress/components";
import {t} from "../editor/src/utils/function.ts";
import {arrowLeft, arrowRight, close, Icon, upload} from "@wordpress/icons";
import cx from "classnames/bind";
import ImportProgress from "./ImportProgress.tsx";
import useSteps from "../Admin/hooks/useSteps.tsx";
import ListingCampaigns from "./ListingCampaigns.tsx";
import Tabs from "./Tabs.tsx";
import {useModal} from "../Admin/hooks/useModal.tsx";
import Stepper from "./Stepper/Stepper.tsx";
import {useStepper} from "../Admin/context/StepsContext.tsx";
import {usePrevious} from "../editor/src/hooks/usePrevious.ts";
import CustomSelect from "./CustomSelect.tsx";
import useDataRecords from "../hooks/useDataRecords.ts";
import {ApiService} from "../editor/src/core/apiService.ts";
import CsvFieldMapper from "./CsvFieldMapper.tsx";
import Tag from "./Tag.tsx";
import {useToasts} from "../editor/src/hooks/useToasts.ts";
import useImportContact from "../Admin/hooks/useImportContact.ts";
import {useImportContext} from "../Admin/context/ImportContactContext.tsx";

const columnData = [
    {label: t("Do not import"), value: ""},
    {label: t("Email"), value: "email"},
    {label: t("First Name"), value: "first_name"},
    {label: t("Last Name"), value: "last_name"},
    {label: t("Created at"), value: "created_at"},
    {label: t("Updated at"), value: "updated_at "},
    {label: t("Add custom field"), value: "create_attribute"},
]


const DropZoneComponent = ({files, onMapChange, mapping, columnMapped, onFileChanged}) => {
    const [hasDropped, setHasDropped] = useState(false);
    const [modalCustomTag, setModalCustomTag] = useState(null);
    const [file, setFile] = useState(files);
    const [array, setArray] = useState([]);

    const fileReader = new FileReader();

    const headerKeys = Object.keys(Object.assign({}, ...array));

    const detectDelimiter = (string) => {
        const potentialDelimiters = [",", ";", "\t", "|"];
        const firstLine = string.split("\n")[0]; // Analyze the header row

        const delimiterCounts = potentialDelimiters.map(delimiter => ({
            delimiter,
            count: firstLine.split(delimiter).length - 1, // Count occurrences
        }));

        // Pick the delimiter with the highest count
        const likelyDelimiter = delimiterCounts.reduce((prev, curr) =>
            curr.count > prev.count ? curr : prev
        );

        return likelyDelimiter.count > 0 ? likelyDelimiter.delimiter : ","; // Default to ',' if unsure
    };

    const csvFileToArray = (string) => {
        // Automatically detect delimiter
        const delimiter = detectDelimiter(string);

        // Determine header row
        const csvHeader = string.slice(0, string.indexOf("\n")).split(delimiter);

        // Get all rows after the header
        const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

        // Map rows to objects, filtering out empty rows
        const array = csvRows
            .filter(row => row.trim() !== "") // Remove completely blank rows
            .map(row => {
                const values = row.split(delimiter);
                const obj = csvHeader.reduce((object, header, index) => {
                    object[header.trim()] = values[index]?.trim() || ""; // Handle missing values
                    return object;
                }, {});
                return obj;
            });

        // Example function to set the parsed array somewhere
        setArray(array);
    };

    useEffect(() => {
        if (file) {

            onFileChanged()

            fileReader.onload = function (event) {
                const text = event.target.result;
                csvFileToArray(text);
            };

            fileReader.readAsText(file);
            setHasDropped(true)
        }
    }, [file]);

    const isEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const onCloseModal = () => {
        setModalCustomTag(null)
        onMapChange('', array, modalCustomTag.key)
    }

    return (
        <>
            {modalCustomTag && <Modal onRequestClose={onCloseModal} size={"small"} title={t('Create custom tag')}>
                Hey
            </Modal>}
            {hasDropped ? <VStack>
                    <>
                        <table>
                            <thead>
                            <tr key={"header"}>
                                {headerKeys.map((key) => (
                                    <th className={
                                        cx({
                                            is_mapped: columnMapped.includes(key)
                                        })
                                    }>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {array.map((item) => (
                                <tr key={item.id}>
                                    {Object.entries(item).map((val) => (
                                        <td className={cx({
                                            is_mapped: columnMapped.includes(val[0])
                                        })}>
                                            <Text weight={"bold"}>{val[1] && val[1].replace(/"/g, '')}</Text>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                </VStack>
                : <VStack style={{height: '100%'}} alignment={"center"} justify={"center"}>
                    <Icon size={30} icon={upload}/>
                    <Text letterSpacing="1.1" size={18} upperCase={true}
                          weight={"bold"}>{t('Drop your CSV file here')}</Text>
                </VStack>}
            <DropZone
                onFilesDrop={files => setFile(files[0])}
            />
        </>
    );
}

const Upload = ({fileDetected}) => {
    const fileReader = new FileReader();

    const {incrementCurrentStep, setData, data} = useStepper();

    useEffect(() => {
        if (fileDetected) {
            fileReader.onload = function (event) {
                const text = event.target.result;
                setData({data: csvFileToArray(text)})
                incrementCurrentStep()
            };

            fileReader.readAsText(fileDetected);
        }
    }, [fileDetected]);

    const detectDelimiter = (string) => {
        const potentialDelimiters = [",", ";", "\t", "|"];
        const firstLine = string.split("\n")[0]; // Analyze the header row

        const delimiterCounts = potentialDelimiters.map(delimiter => ({
            delimiter,
            count: firstLine.split(delimiter).length - 1, // Count occurrences
        }));

        // Pick the delimiter with the highest count
        const likelyDelimiter = delimiterCounts.reduce((prev, curr) =>
            curr.count > prev.count ? curr : prev
        );

        return likelyDelimiter.count > 0 ? likelyDelimiter.delimiter : ","; // Default to ',' if unsure
    };

    const csvFileToArray = (string) => {
        // Automatically detect delimiter
        const delimiter = detectDelimiter(string);

        // Determine header row
        const csvHeader = string.slice(0, string.indexOf("\n")).split(delimiter);

        // Get all rows after the header
        const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

        // Map rows to objects, filtering out empty rows
        const array = csvRows
            .filter(row => row.trim() !== "") // Remove completely blank rows
            .map(row => {
                const values = row.split(delimiter);
                const obj = csvHeader.reduce((object, header, index) => {
                    object[header.trim()] = values[index]?.trim() || ""; // Handle missing values
                    return object;
                }, {});
                return obj;
            });

        // Example function to set the parsed array somewhere
        return array
    };

    const handleFile = file => {
        if (file) {
            fileReader.onload = function (event) {
                const text = event.target.result;
                setData({data: csvFileToArray(text)})
            };
            fileReader.readAsText(file);
        }
    }

    useEffect(() => {
        if (data.data.length > 0) {
            incrementCurrentStep()
        }
    }, [data]);

    return (
        <VStack style={{height: '100%'}}>
            <VStack spacing={4} expanded={true} justify="flex-start">
                <Heading level={1}>
                    Upload a file
                </Heading>
                <div
                    className="drop-zone"
                >
                    <VStack style={{height: '100%'}} alignment={"center"} justify={"center"}>
                        <Icon size={30} icon={upload}/>
                        <Text letterSpacing="1.1" size={18} upperCase={true}
                              weight={"bold"}>{t('Drop your CSV file here')}</Text>
                    </VStack>
                    <DropZone
                        onFilesDrop={files => handleFile(files[0])}
                    />
                </div>
            </VStack>
            <HStack className={"sticky-actions"} alignment="center">
                <Button
                    variant="tertiary"
                    icon={arrowRight}
                    disabled={data.data && data.data.length === 0}
                    onClick={incrementCurrentStep}>Next step</Button>
            </HStack>
        </VStack>
    )
}

const Review = () => {
    const {incrementCurrentStep, decrementCurrentStep, data} = useStepper();

    const headerKeys = Object.keys(Object.assign({}, ...data.data));

    return (
        <VStack style={{height: '100%', justifyContent: "flex-start"}}>
            <div className="table" style={{maxWidth: '100%', overflow: "auto"}}>
                <table>
                    <thead>
                    <tr key={"header"}>
                        {headerKeys.map((key) => (
                            <th>
                                <Text uppercase={true} size={16} weight={"bold"}>{key && key.replace(/"/g, '')}</Text>
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {data.data.map((item) => (
                        <tr key={item.id}>
                            {Object.entries(item).map((val) => (
                                <td>
                                    <Text weight={"bold"}>{val[1] && val[1].replace(/"/g, '')}</Text>
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <HStack className={"sticky-actions"}>
                <Button variant="tertiary" icon={arrowLeft} onClick={decrementCurrentStep}>Previous step</Button>
                <Button variant="tertiary" icon={arrowRight} onClick={incrementCurrentStep}>Next step</Button>
            </HStack>
        </VStack>
    )
}

const Tags = () => {
    const {incrementCurrentStep, decrementCurrentStep, data, setData} = useStepper();
    const [tags, setTags] = useState(data.tags || [])
    const [lists, setLists] = useState(data.lists || [])

    const [options, setOptions] = useState(
        window.jsVars.contactTags.reduce((acc, item) => {
            acc.push({
                id: parseInt(item.tag_id),
                label: item.name
            })
            return acc;
        }, [])
    );

    const [optionsLists, setOptionsLists] = useState(
        window.jsVars.lists.reduce((acc, item) => {
            acc.push({
                id: parseInt(item.list_id),
                label: item.name
            })
            return acc;
        }, [])
    );

    const handleCreateOption = (newOption) => {
        ApiService
            .createTag(newOption)
            .then(res => {
                setOptions((prevOptions) => [...prevOptions, res])
                setTags((prevTags) => [...prevTags, res])
            })
    };

    const handleCreateList = (newOption) => {
        ApiService
            .createNewList(newOption)
            .then(res => {
                setOptionsLists((prevOptions) => [...prevOptions, res])
                setLists((prevTags) => [...prevTags, res])
            })
    };


    const handleDeleteTag = (tag) => {
        setTags(tags.filter((t) => t.id !== tag.id))
    }


    const handleDeleteList = (tag) => {
        setLists(lists.filter((t) => t.id !== tag.id))
    }

    const handleOptionSelect = (option) => {
        setTags([...tags, option])
    };

    const handleNextStep = () => {
        setData({
            lists,
            tags
        })
        incrementCurrentStep()
    }

    return (
        <VStack style={{height: '100%', justifyContent: "flex-start"}}>
            <VStack spacing={4} expanded={true} justify="flex-start">
                <Heading level={1}>
                    List & Tag your contacts
                </Heading>
                <Text>
                    Tag are labels you create to differentiate your contacts. You can use tags to send personalized
                    marketing, create a segment or to set up an automation. Any tags you add or create here will appear
                    in your contacts table after your import is complete.
                </Text>

                <CustomSelect
                    selection={lists}
                    label={t('Select or create list')}
                    initialOptions={optionsLists}
                    onCreateOption={handleCreateList}
                    onOptionSelect={(selectedOption) => {
                        setLists([...lists, selectedOption])
                    }}
                    onDelete={handleDeleteList}
                />

                <CustomSelect
                    selection={tags}
                    label={t('Select or create tag')}
                    initialOptions={options}
                    onCreateOption={handleCreateOption}
                    onOptionSelect={handleOptionSelect}
                    onDelete={handleDeleteTag}
                />
            </VStack>
            <HStack className={"sticky-actions"}>
                <Button variant="tertiary" icon={arrowLeft} onClick={decrementCurrentStep}>Previous step</Button>
                <Button
                    variant="tertiary"
                    icon={arrowRight}
                    onClick={handleNextStep}
                >Next step</Button>
            </HStack>
        </VStack>
    )
}

const Mapping = () => {
    const [importMapping, setImportMapping] = useState(null);
    const [columnMapped, setColumnMapped] = useState([]);

    const {incrementCurrentStep, decrementCurrentStep, data, setData} = useStepper();

    const headerKeys = Object.keys(Object.assign({}, ...data.data));

    const onMapChange = (val, key) => {

        let exist: boolean | string = false;

        if (importMapping) {
            // value = Object.keys(importMapping).find(k => k === val)
            exist = Object.keys(importMapping).find(k => k.includes(key));
        }


        if (exist && val === '') {
            const {[exist]: _, ...rest} = importMapping;
            setImportMapping(rest)
            setColumnMapped(
                columnMapped.filter(c => c !== key)
            )
        } else {
            if (val !== '' && (exist === false || undefined === exist)) {
                setImportMapping({
                    ...importMapping,
                    [`${val}:${key}`]: data.data.map(a => a[key])
                })

                setColumnMapped([...columnMapped, key])
            } else {
                if (exist) {
                    const {[exist]: _, ...rest} = importMapping;
                    setImportMapping({
                        ...rest,
                        [`${val}:${key}`]: data.data.map(a => a[key])
                    })

                    setColumnMapped([...columnMapped, key])
                }

            }
        }
    }

    function reformatData(data) {
        // Get all the keys from the object
        const keys = Object.keys(data);

        // Get the length of one of the arrays (assuming all arrays have the same length)
        const length = data[keys[0]].length;

        // Create the reformatted array of objects
        const result = [];

        for (let i = 0; i < length; i++) {
            const obj = {};

            // Iterate over all keys and assign each key's value to the object at index i
            keys.forEach(key => {
                obj[key] = data[key][i];
            });

            result.push(obj);
        }

        return result;
    }

    const handleNextStep = () => {
        setData({
            mapping: reformatData(
                Object.keys(importMapping).reduce((acc, key) => {
                    const newKey = key.split(':')[0]; // Keep only the part before the colon
                    acc[newKey] = importMapping[key]; // Assign the original value to the new key
                    return acc;
                }, {})
            )
        })
        incrementCurrentStep()
    }

    useEffect(() => {
        console.log('DATA', data)
    }, [data]);

    useEffect(() => {
        console.log('columnMapped', columnMapped)
    }, [columnMapped]);

    return (
        <VStack style={{height: '100%', justifyContent: "flex-start"}}>
            <VStack spacing={4} expanded={true} justify="flex-start">
                <Heading level={1}>
                    Match column labels to contact information
                </Heading>
                <Text>
                    To ensure all key contact information is imported, match the columns in your import file to audience
                    fields in MailerPress. Click any column header to select the matching audience field. </Text>
                <CsvFieldMapper
                    mapping={importMapping}
                    data={data.data}
                    columnMapped={columnMapped}
                    columns={headerKeys}
                    fields={columnData}
                    onMapChange={onMapChange}
                />
            </VStack>
            <HStack className={"sticky-actions"}>
                <Button variant="tertiary" icon={arrowLeft} onClick={decrementCurrentStep}>Previous step</Button>
                <Button
                    disabled={(importMapping === null || Object.keys(importMapping).length === 0)}
                    variant="tertiary"
                    icon={arrowRight}
                    onClick={handleNextStep}
                >Next step</Button>
            </HStack>
        </VStack>
    )
}

const SubscriptionStatus = () => {
    const {incrementCurrentStep, decrementCurrentStep, setData, data} = useStepper();
    const [status, setStatus] = useState(data.status || '')
    const handleNextStep = () => {
        setData({status})
        incrementCurrentStep()
    }

    return (
        <VStack style={{height: '100%', justifyContent: "flex-start"}}>
            <VStack spacing={4} expanded={true} justify="flex-start">
                <Heading level={1}>
                    Subscribe contacts to marketing
                </Heading>
                <Text>
                    The status you assign to the contacts in this file will only be applied to new contacts. Existing
                    contacts will not have their subscription status updated, but any other data that may have changed
                    will be updated.
                </Text>

                <SelectControl
                    value={status}
                    label={t('Select email marketing status')}
                    onChange={setStatus}
                    options={[
                        {label: t('Select a status'), value: ''},
                        {label: t('Subscribed'), value: 'subscribed'},
                        {label: t('Unsubscribed'), value: 'unsubscribed'},
                        {label: t('Pending'), value: 'pending'},
                    ]}
                />
            </VStack>
            <HStack className={"sticky-actions"}>
                <Button variant="tertiary" icon={arrowLeft} onClick={decrementCurrentStep}>Previous step</Button>
                <Button
                    disabled={status === ''}
                    variant="tertiary"
                    icon={arrowRight}
                    onClick={handleNextStep}
                >Next step</Button>
            </HStack>
        </VStack>
    )
}

const Import = ({closeModal}) => {
    const [checked, setChecked] = useState(false)
    const {decrementCurrentStep, data} = useStepper();
    const {pushToast} = useToasts();
    const {startImport, setIsImporting} = useImportContext()
    const [importLive, setImportLive] = useState(false)
    const onImport = () => {
        if (data.mapping.length > 200) {
            startImport({
                ...data,
                forceUpdate: checked
            }).then(r => {
                closeModal()
                setTimeout(() => {
                    setIsImporting(true)
                    pushToast({
                        title: t('Your import is now running in background'),
                        type: 'success',
                        duration: 5
                    })
                }, 150)
            })
        } else {
            setImportLive(true)
        }

    }

    const tagType = () => {
        switch (data.status) {
            case "subscribed":
                return 'success';
            case 'unsubscribed':
                return 'error';
            default:
                return 'warning'
        }
    }

    return (
        importLive === false ?
            <VStack style={{height: '100%', justifyContent: "flex-start"}}>
                <VStack spacing={4} expanded={true} justify="flex-start">
                    <Heading level={1}>
                        Review and complete your import
                    </Heading>

                    <VStack expanded={false} justify={"flex-start"} alignment={"left"}>
                        <Heading level={3}>
                            {new Intl.NumberFormat('fr-FR', {maximumSignificantDigits: 3}).format(data.mapping.length,)} contacts
                            will be added to your audience
                        </Heading>
                        <Spacer marginTop={2}/>
                        <HStack justify={"flex-start"}>
                            <Text size={14}>Email marketing status :</Text>
                            <Tag withPoint={true} type={tagType()}>{data.status}</Tag>
                        </HStack>
                        <HStack justify={"flex-start"}>
                            {data.lists.length && <>
                                <Text size={14}>lists:</Text>
                                {data.lists.map(t => <Tag type="info">{t.label}</Tag>)}
                            </>
                            }
                            {data.tags.length && <>
                                <Text size={14}>Tagged:</Text>
                                {data.tags.map(t => <Tag type="info">{t.label}</Tag>)}
                            </>
                            }
                        </HStack>

                        <Spacer marginTop={2}/>

                        <CheckboxControl
                            checked={checked}
                            __nextHasNoMarginBottom
                            help={t('By checking this box, existing contacts will be updated\n')}
                            label={t('Update existing contact')}
                            onChange={setChecked}
                        />

                        <Spacer marginTop={2}/>

                        <Button variant={"primary"} onClick={onImport}>
                            {t('Start import')}
                        </Button>

                        <Spacer marginTop={4}/>


                        {data.mapping.length > 200 ? <Text variant={"muted"} size={"10px"}>
                            {t('Your import contains more than 200 contacts, it will therefore be processed in the background')}
                        </Text> : <Text variant={"muted"} size={"10px"}>
                            {t('Your import will be processed directly, please do not leave the current page during the process')}
                        </Text>}
                    </VStack>
                </VStack>
                <HStack className={"sticky-actions"}>
                    <Button variant="tertiary" icon={arrowLeft} onClick={decrementCurrentStep}>Previous step</Button>
                </HStack>
            </VStack>
            :
            <ImportProgress data={{
                ...data,
                forceUpdate: checked
            }}/>
    )
}

function ContactImporter({file, closeModal}) {
    const {incrementCurrentStep, decrementCurrentStep, setCurrentStep, setData} = useStepper();

    useEffect(() => {
        setData({data: []})
        setCurrentStep(0)
    }, []);

    const fileDetected = useMemo(() => {
        if (file) {
            return file
        } else {
            return null
        }
    }, [file]);

    return (
        <>
            <HStack expanded={true} justify="space-between">
                <Heading level={3}>
                    {t('Import Contacts')}
                </Heading>
                <Button icon={close} onClick={closeModal}/>
            </HStack>

            <Spacer marginTop={1}/>

            <Stepper>
                <Stepper.Steps>
                    <Stepper.Step id="upload" name="Upload">
                        <Upload fileDetected={fileDetected}/>
                    </Stepper.Step>
                    <Stepper.Step id="mapping" name="Mapping">
                        <Mapping/>
                    </Stepper.Step>
                    <Stepper.Step id="tag" name="Tag">
                        <Tags/>
                    </Stepper.Step>
                    <Stepper.Step id="subscription" name="Subscription">
                        <SubscriptionStatus/>
                    </Stepper.Step>
                    <Stepper.Step id="import" name="Import">
                        <Import closeModal={closeModal}/>
                    </Stepper.Step>
                </Stepper.Steps>

            </Stepper>
        </>
    )
}

export default ContactImporter