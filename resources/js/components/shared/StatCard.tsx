type StatCardProps = {
    label: string;
    value: string | number;
};

export function StatCard({ label, value }: StatCardProps) {
    return (
        <div>
            <p>{value}</p>
            <p>{label}</p>
        </div>
    );
}
