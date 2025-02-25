import {
    __experimentalHeading as Heading,
    __experimentalVStack as VStack,
    __experimentalText as Text,
    Flex
} from "@wordpress/components";
import React from "react";
import {t} from "../../editor/src/utils/function.ts";
import {classnames} from "../../editor/src/utils/classnames.ts";

type Props = {
    mainTitle: string; // Assuming it's a string. Adjust type as needed.
    children?: React.ReactNode; // For React component children
    classes?: string;
    desc?: string
    // Optional string
};
const ComponentWrapper: React.FC<Props> = ({mainTitle, children, classes, actions, desc}) => {
    return (
        <div className={classnames("component-view", classes ?? '')}>
            <div className="container">
                {mainTitle && <header>
                    <Flex>
                        <VStack spacing={0}>
                            <Heading level={1}>{t(mainTitle)}</Heading>
                            {desc && <Text variant={"muted"}>{t(desc)}</Text>}
                        </VStack>
                        {actions && actions.length > 0 &&
                            <Flex expanded={false}>
                                {actions.map(component => <div>{component}</div>)}
                            </Flex>
                        }
                    </Flex>
                </header>
                }

                {children &&
                    <div className="content">
                        <div className={"content__wrapper"}>
                            {children}
                        </div>
                    </div>
                }

            </div>
        </div>
    )
}

export default ComponentWrapper
