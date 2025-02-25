import {DECREMENT_CURRENT_STEP, INCREMENT_CURRENT_STEP, SET_STEPS, SET_DATA, SET_CURRENT_STEP} from "./constants.ts";

export const defaultStepperState = {
    steps: [],
    currentStep: 0,
    data: []
};

export const stepperReducer = (state = defaultStepperState, action) => {
    const {currentStep, steps, data} = state;
    const {type, payload} = action;

    switch (type) {
        case SET_STEPS:
            return {
                ...state,
                steps: payload.steps
            };
        case INCREMENT_CURRENT_STEP:
            return {
                ...state,
                currentStep:
                    currentStep < steps.length - 1
                        ? currentStep + 1
                        : currentStep
            };
        case DECREMENT_CURRENT_STEP:
            return {
                ...state,
                currentStep:
                    currentStep > 0
                        ? currentStep - 1
                        : currentStep
            };
        case SET_DATA:
            return {
                ...state,
                data: {...data, ...payload}
            };
        case SET_CURRENT_STEP:
            return {
                ...state,
                currentStep: payload
            };

        default:
            return state;
    }
};
