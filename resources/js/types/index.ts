export type ApiStatus = 'success' | 'error';

export type ApiResponse<T> = {
    status: ApiStatus;
    message: string;
    data: T;
};

export type SystemStatus = {
    app: string;
    environment: string;
    backend: string;
    frontend: string;
    query: string;
    database: string;
    timestamp: string;
};
