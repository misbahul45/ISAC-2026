type ClassValue =
    | string
    | false
    | null
    | undefined
    | ((state: any) => string | undefined);

export function cn(...classes: Array<string | false | null | undefined>): string;
export function cn(...classes: ClassValue[]): any;
export function cn(...classes: ClassValue[]): string | ((state: any) => string) {
    const hasStateClass = classes.some((className) => typeof className === 'function');

    if (hasStateClass) {
        return (state: any) =>
            classes
                .map((className) =>
                    typeof className === 'function' ? className(state) : className,
                )
                .filter(Boolean)
                .join(' ');
    }

    return classes.filter(Boolean).join(' ');
}
