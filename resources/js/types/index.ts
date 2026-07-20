export type {
    ApiErrorDetail,
    ApiFieldErrors,
    ApiMetadata,
    ApiResponse,
    ApiStatus,
    PaginatedData,
    PaginationLinks,
    PaginationMeta,
    PaginationQuery,
    RedirectData,
} from './api';

export type SystemStatus = {
    app: string;
    environment: string;
    backend: string;
    frontend: string;
    query: string;
    database: string;
    timestamp: string;
};
