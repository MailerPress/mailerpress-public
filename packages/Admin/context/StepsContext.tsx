import React, {useContext, useReducer, useCallback} from 'react';
import {defaultStepperState, stepperReducer as reducer} from '../store/stepperReducer.ts';
import {
    DECREMENT_CURRENT_STEP,
    INCREMENT_CURRENT_STEP,
    SET_CURRENT_STEP,
    SET_DATA,
    SET_STEPS
} from "../store/constants.ts";

export const StepperContext = React.createContext(null);

export const StepperProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, defaultStepperState);

    return (
        <StepperContext.Provider value={[state, dispatch]}>
            {children}
        </StepperContext.Provider>
    );
};

export const useStepper = () => {
    const [state, dispatch] = useContext(StepperContext);
    const {currentStep, steps, data} = state;

    if (!StepperContext) {
        throw new Error('useStepper should be used inside StepperProvider')
    }

    const incrementCurrentStep = useCallback(() => {
        dispatch({
            type: INCREMENT_CURRENT_STEP
        });
    }, [dispatch]);

    const decrementCurrentStep = useCallback(() => {
        dispatch({
            type: DECREMENT_CURRENT_STEP
        });
    }, [dispatch]);

    const setData = useCallback((data) => {
        dispatch({
            type: SET_DATA,
            payload: data
        });
    }, [dispatch]);

    const setSteps = useCallback(steps => dispatch({type: SET_STEPS, payload: {steps}}), [dispatch]);

    const setCurrentStep = useCallback((setp) => {
        dispatch({
            type: SET_CURRENT_STEP,
            payload: setp
        });
    }, [dispatch]);

    return {
        incrementCurrentStep,
        decrementCurrentStep,
        setSteps,
        currentStep,
        steps,
        setData,
        data,
        setCurrentStep
    }
}