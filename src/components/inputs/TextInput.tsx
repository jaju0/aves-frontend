export function TextInput(props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>)
{
    return (
        <input {...props} type="text" className={`${props.className} block w-full bg-transparent focus:outline-0`} />
    )
}