
export function SubmitInput(props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>)
{
    return (
        <button type="submit" className={`${props.className} transition duration-150 ease-in-out delay-100 block px-4 py-1 rounded-full border-2 hover:bg-white hover:text-indigo-400 cursor-pointer`} {...props}></button>
    );
}