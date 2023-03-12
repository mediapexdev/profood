/**
 * 
 */
import { configureStore, createAction, createReducer } from "@reduxjs/toolkit";

/**
 * 
 */
const initialState = {
	selectedCategory: 1,
	selectedBox: 1,
};

/**
 * 
 */
const counterState = {
	choices: [],
};

/**
 * 
 * @returns 
 */
export const globalCounter = () => {
	let globalCounter = 0;
	const choices = store.getState().counter.choices;
	choices?.map((choice) => (globalCounter += choice.counter));

	return globalCounter;
};

/**
 * 
 */
export const initChoice = createAction("Choices/init", () => {});

/**
 * 
 */
export const incrementSlice = createAction("Slice/increment", (slice_id) => {
	// return {payload:slice_id}
});

/**
 * 
 */
export const decreaseSlice = createAction("Slice/decrease", (slice_id) => {
	// return {payload:slice_id}
});

/**
 * 
 */
export const changeBoxType = createAction("BoxType/change", (selectedBox) => {
	return {
		payload: { selectedBox },
	};
});

/**
 * 
 */
export const chooseCategory = createAction("Category/choose", (selectedCategory) => {
	return {
		payload: { selectedCategory },
	};
});

/**
 * 
 */
const sliceReducer = createReducer(initialState, (builder) => {
	return builder
    .addCase(chooseCategory, (state, action) => {
    	state.selectedCategory = action.selectedCategory;
    	return action.payload;
    })
    .addCase(changeBoxType, (state, action) => {
      state.selectedBox = action.selectedBox;
	  console.log(action.selectedBox)
      return action.payload;
    });
});

/**
 * 
 */
const counterReducer = createReducer(counterState, (builder) => {
	return builder
    .addCase(incrementSlice, (state, action) => {
    	if (state.choices.find((choice) => choice.slice.id === action.slice.id) === undefined) {
			state.choices.push({ slice: action.slice, counter: 1 });
		}
    	else {
			state.choices.find((choice) => choice.slice.id === action.slice.id).counter++;
		}
    })
    .addCase(decreaseSlice, (state, action) => {
		// if (
		//   state.choices.find((choice) => choice.slice.id === action.slice_id)
		//     .counter > 0
		// )
		let deleteIndex = null;
        state.choices.forEach((choice,index) => {
        	if(choice.slice.id === action.slice_id) {
            	if(choice.counter <= 1) {
              		deleteIndex = index;
            	}
				else {
					choice.counter--;
				}
        	}
        })
        if(deleteIndex !== null){
			state.choices.splice(deleteIndex, 1);
		}
        // state.choices.find((choice) => choice.slice.id === action.slice_id).counter--;
    })
    .addCase(initChoice, (state) => {
    	state.choices.length = 0;
    	console.log('init');
    });
});

/**
 * 
 */
const store = configureStore({
	reducer: { slice: sliceReducer, counter: counterReducer },
});

export default store;
