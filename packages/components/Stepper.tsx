import React from "react";
import {
    __experimentalText as Text,
    Icon
} from "@wordpress/components";
import {check} from "@wordpress/icons";

const Stepper = ({steps, activeStep, orientation = "horizontal"}) => {
    return (
        <div className={`stepper stepper-${orientation}`}>
            {steps.map((step, index) => (
                <div
                    key={index}
                    className={`step ${
                        index < activeStep ? "completed" : index === activeStep ? "active" : ""
                    }`}
                >

                    <div className="step-icon">
                        <Text color={"white"} weight={"bold"}>
                            {index < activeStep ?
                                <span style={{fill: 'white', display: "flex", alignItems: "center"}}><Icon
                                    icon={check}/></span> : index + 1}
                        </Text>
                    </div>
                    <div className="step-label">
                        <Text variant={"muted"}>
                            {step.label}
                        </Text>
                    </div>
                    <div className="step-connector"/>
                </div>
            ))}
        </div>
    );
};


export default Stepper;
