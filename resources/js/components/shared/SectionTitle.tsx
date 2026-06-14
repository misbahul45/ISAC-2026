type SectionTitleProps = {
    children: string;
};

export function SectionTitle({ children }: SectionTitleProps) {
    return <h2>{children}</h2>;
}
