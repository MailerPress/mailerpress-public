import React, {useState} from 'react'

export default function useSteps({steps}) {

    const [stepsData] = useState(steps)

    const [activeStep, setActiveStep] = useState(0)

    return {
        steps: stepsData,
        activeStep,
        setActiveStep,
        next: () => setActiveStep((prev) => prev + 1),
        prev: () => setActiveStep((prev) => prev - 1),
    }
}