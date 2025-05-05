import Link from "next/link";





type Props = {
    navigate?:string;
    containerClass?:string;
    content:string;
    className?:string;
}

const ClientLink = ({navigate,className,content,containerClass}: Props) => {
  return (
    <Link href={`/${navigate || content.toLowerCase()}`} className={containerClass}>
        <span className={className}>{content}</span>
    </Link>
  )
}

export default ClientLink;