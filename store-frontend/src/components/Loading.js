import React, { } from 'react'
import { useDashboardContext } from '../app-context/dashboardContext';

const Loading = function() {
    const { loading } = useDashboardContext();
    if (loading) {
        return (
            <main>
                <h3>Loading...</h3>
            </main>
        );
    }
}

export default Loading