import React, {useState, useEffect} from 'react';
import {
    __experimentalVStack as VStack,
    __experimentalText as Text,
    __experimentalHeading as Heading,
    __experimentalSpacer as Spacer,
    Button
} from "@wordpress/components";
import {useModal} from "../Admin/hooks/useModal.tsx";
import {ApiService} from "../editor/src/core/apiService.ts";
import {__} from '@wordpress/i18n';

const ProgressBar = ({progress, total}) => (
    <VStack alignment={'center'}>
        <Heading level={1}>
            Importing {total} contacts
        </Heading>
        <Text variant={'muted'} weight={"bold"}>
            {Math.ceil(progress)}%
        </Text>
        <div style={{width: '100%', backgroundColor: '#ccc', height: '10px', borderRadius: 20}}>
            <div
                style={{
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? '#4caf50' : '#007cba',
                    height: '100%',
                    transition: 'width 0.3s ease',
                    borderRadius: 20
                }}
            />
        </div>
    </VStack>
);

const ImportProgress = ({data}) => {
    const [progress, setProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [error, setError] = useState(null);
    const {setModal} = useModal()

    useEffect(() => {
        const totalItems = data.mapping.length;

        // Simulate a 300ms delay for each HTTP request
        const makeRequest = async (item) => {
            return ApiService.insertContact({
                item,
                status: data.status,
                tags: data.tags,
                lists: data.lists,
                forceUpdate: data.forceUpdate
            })
        };

        const fetchData = async () => {
            let completedRequests = 0;
            let failedRequests = 0;

            // Map through the data and execute the HTTP request for each item
            for (let i = 0; i < totalItems; i++) {
                try {
                    await makeRequest(data.mapping[i]); // Make request for the current item
                    completedRequests++;
                } catch (err) {
                    console.error(err);
                    failedRequests++;
                }

                // Update progress after each request
                const newProgress = ((completedRequests + failedRequests) / totalItems) * 100;
                setProgress(newProgress);
            }

            // After all items are processed, mark as completed
            setIsCompleted(true);
        };

        fetchData();
    }, [data]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: "center"
        }}>
            {error && <div style={{color: 'red'}}>Error: {error}</div>}
            {!isCompleted &&
                <ProgressBar progress={progress} total={data.length}/>
            }
            {isCompleted && !error && (
                <>
                    <Spacer marginTop="40px"/>
                    <VStack alignment={"center"} spacing={4}>
                        <Heading level={2}>
                            {__('All good, your contacts are now imported', 'mailerpress')}
                        </Heading>
                        <div>
                            <div className="success-checkmark">
                                <div className="check-icon">
                                    <span className="icon-line line-tip"></span>
                                    <span className="icon-line line-long"></span>
                                    <div className="icon-circle"></div>
                                    <div className="icon-fix"></div>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => window.location.reload()} variant={"tertiary"}>
                            Show you contacts
                        </Button>
                    </VStack>
                </>

            )}
        </div>
    );
};

export default ImportProgress;
