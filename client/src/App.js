import React from 'react';
import {AuthContextProvider} from './AuthContext';
import Routes from './Routes';

const App = () => (
    <AuthContextProvider>
        <Routes />
    </AuthContextProvider>
);

export default App;
