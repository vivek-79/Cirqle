
"use client"

type Props = {
    containerClass?: string;
    content: string;
    className?: string;
    onPress?:()=>void
}

const ClientButton = ({ className, content, containerClass,onPress }: Props) => {
    return (
        <button onClick={onPress} className={`${containerClass} cursor-pointer transition-colors duration-300`}>
            <span className={className}>{content}</span>
        </button>
    )
}

export default ClientButton;