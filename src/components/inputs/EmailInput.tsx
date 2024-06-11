
export function EmailInput(props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>)
{
    return (
        <input {...props} type="email" className={`${props.className} block w-full bg-transparent px-4 py-1 rounded-full border-2 focus:outline-0`} />
    );
}