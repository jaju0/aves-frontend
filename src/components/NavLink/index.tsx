import { useNavigate } from "react-router-dom";

export interface NavLinkProps
{
    to?: string;
}

export function NavLink(props: NavLinkProps & React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>)
{
    const navigate = useNavigate();

    const linkClicked = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if(props.to)
            event.preventDefault();

        if(props.onClick)
            props.onClick(event);

        if(props.to)
            navigate(props.to);
    };

    return (
        <a {...props} onClick={linkClicked}>
            {props.children}
        </a>
    );
}