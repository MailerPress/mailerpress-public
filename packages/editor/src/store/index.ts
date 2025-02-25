import { createReduxStore, register } from '@wordpress/data'
import actions from './actions.ts'
import reducer from './reducer.ts'
import selectors from './selectors.ts'
import {STORE_KEY} from "../constants.ts";

const store = createReduxStore(STORE_KEY, {
    reducer,
    actions,
    selectors
})

register(store)