import React from 'react';
import {useStepper} from "../../Admin/context/StepsContext.tsx";
import {StepperStep, StepperSteps} from "./StepperSteps.tsx";
import cx from "classnames/bind";
import {check} from "@wordpress/icons";
import {Icon} from "@wordpress/components";

const Stepper = ({children}) => {
    const {
        currentStep,
        steps
    } = useStepper();


    return (
        <div className="mailerpress-stepper">
            <header>
                {steps && steps.length ?
                    steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={cx({
                                step: true,
                                completed: index < currentStep,
                                active: currentStep >= index
                            })}
                        >
                            <div className="step-counter">
                                <>
                                    {index < currentStep && <Icon icon={check}/>}
                                    <span>
                                       {index + 1}
                                    </span>
                                </>
                            </div>
                            <div className="step-name">{step.name}</div>
                        </div>
                    )) : null}
            </header>
            <div className="body">
                <div>
                    {children}
                </div>
            </div>
        </div>
    )
};

Stepper.Step = StepperStep;
Stepper.Steps = StepperSteps;

export default Stepper;
