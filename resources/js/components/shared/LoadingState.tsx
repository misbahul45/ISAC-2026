type LoadingStateProps = {
    message?: string;
};

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return <p>{message}</p>;
}
