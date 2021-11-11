/// <reference types="react-scripts" />
declare module '*.json' {
    const value: any;
    export default value;
}

// declare module '*.less';

declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}

declare module 'redux-persist/lib/storage';
