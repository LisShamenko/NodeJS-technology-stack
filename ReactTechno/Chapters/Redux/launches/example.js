// Example.

import emptyStore from './../stores/empty';
import { useData } from './../actions/useData';

// создать хранилище
const store = emptyStore();

// выполнить два действия над данными в хранилище
store.dispatch(useData());
store.dispatch(useData());

// Run example
//      import './example';