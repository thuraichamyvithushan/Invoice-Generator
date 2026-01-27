import React from 'react';
import Navbar from '../components/Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-surface-100 dark:bg-dark-surface-100 text-content-100 dark:text-dark-content-100">
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
