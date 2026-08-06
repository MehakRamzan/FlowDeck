type StatCardProps = {
    label: string;
    value: number;
    note: string;
}


function StatCard({ label, value, note }: StatCardProps) {

    return (
        <article className="rounded-(--radius-lg) border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
            <p className="text-sm font-medium text-(--color-text-secondary)">
                {label}

            </p>
            <p  className="mt-3 font-(--font-heading) text-3xl font-bold text-(--color-text-primary)">
                {value}
            </p>
            <p className="mt-2 text-xs text-(--color-text-secondary)" >
                {note  }
            </p>

        </article>
    )



}


export default StatCard;